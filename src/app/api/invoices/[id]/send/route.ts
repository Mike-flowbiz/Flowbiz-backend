import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuthz } from '@/lib/middleware/auth';
import { generateInvoicePDF } from '@/backend/utils/pdf';
import { uploadInvoicePDF, isS3Configured } from '@/backend/utils/s3';
import { sendEmail, buildInvoiceEmail, isEmailConfigured } from '@/backend/utils/email';

// POST /api/invoices/[id]/send - Send invoice to client via email
export const POST = withAuthz(
  ['ADMIN', 'CONTRACTOR'],
  async (request: NextRequest, user, { params }) => {
    const { id } = await params;

    try {
      if (!isEmailConfigured()) {
        return NextResponse.json(
          {
            error:
              'Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment variables.',
          },
          { status: 503 }
        );
      }

      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          client: true,
          invoiceItems: { include: { product: true } },
        },
      });

      if (!invoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      if (invoice.status === 'CANCELLED') {
        return NextResponse.json(
          { error: 'Cannot send a cancelled invoice' },
          { status: 400 }
        );
      }

      const settings = await prisma.businessSetting.findFirst();

      // Generate PDF if not yet created
      let pdfBuffer: Buffer | null = null;
      let pdfUrl = invoice.pdfUrl;

      pdfBuffer = await generateInvoicePDF(invoice as any, settings);

      // Try to upload to S3 so the email can include a view link
      if (isS3Configured() && !pdfUrl) {
        try {
          pdfUrl = await uploadInvoicePDF(pdfBuffer, invoice.invoiceNumber);
        } catch {
          // Non-fatal; we'll attach the PDF directly instead
        }
      }

      // Build email HTML
      const html = buildInvoiceEmail({
        invoiceNumber: invoice.invoiceNumber,
        clientName: invoice.client.name,
        companyName: settings?.companyName || 'FlowBiz',
        companyEmail: settings?.companyEmail,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        subtotal: invoice.subtotal,
        vatRate: invoice.vatRate,
        vatAmount: invoice.vatAmount,
        total: invoice.total,
        notes: invoice.notes,
        primaryColor: settings?.primaryColor,
        pdfUrl: pdfUrl || undefined,
      });

      const companyName = settings?.companyName || 'FlowBiz';

      await sendEmail({
        to: invoice.client.email,
        subject: `Invoice ${invoice.invoiceNumber} from ${companyName}`,
        html,
        attachments: [
          {
            filename: `invoice-${invoice.invoiceNumber}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });

      // Update invoice: mark as SENT, store pdfUrl if we have one
      const updatedInvoice = await prisma.invoice.update({
        where: { id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
          ...(pdfUrl ? { pdfUrl } : {}),
        },
      });

      return NextResponse.json({
        message: `Invoice ${invoice.invoiceNumber} sent to ${invoice.client.email}`,
        invoice: updatedInvoice,
      });
    } catch (error: any) {
      console.error('Send invoice error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send invoice' },
        { status: 500 }
      );
    }
  }
);
