import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuthz } from '@/lib/middleware/auth';
import { generateInvoicePDF } from '@/backend/utils/pdf';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

function streamPdf(buffer: Buffer, invoiceNumber: string) {
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoiceNumber}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}

// GET /api/portal/invoices/[id]/pdf - Download invoice PDF for a CLIENT user.
// First hit generates and caches the PDF as a data URL on invoice.pdfUrl;
// subsequent hits serve directly from that cache.
export const GET = withAuthz(
  ['CLIENT'],
  async (request: NextRequest, user, { params }) => {
    const { id } = await params;

    try {
      const [client, invoice, settings] = await Promise.all([
        prisma.client.findUnique({ where: { email: user.email } }),
        prisma.invoice.findUnique({
          where: { id },
          include: {
            client: true,
            invoiceItems: { include: { product: true } },
          },
        }),
        prisma.businessSetting.findFirst(),
      ]);

      if (!client) {
        return NextResponse.json(
          { error: 'No client account found for this email address.' },
          { status: 404 }
        );
      }

      if (!invoice || invoice.clientId !== client.id) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      // Fast path: cached PDF stored as a data URL
      if (invoice.pdfUrl?.startsWith('data:application/pdf;base64,')) {
        const base64 = invoice.pdfUrl.substring('data:application/pdf;base64,'.length);
        return streamPdf(Buffer.from(base64, 'base64'), invoice.invoiceNumber);
      }

      // Remote URL (e.g. S3): redirect
      if (invoice.pdfUrl && /^https?:\/\//i.test(invoice.pdfUrl)) {
        return NextResponse.redirect(new URL(invoice.pdfUrl));
      }

      // Cold path: generate and cache
      const pdfBuffer = await generateInvoicePDF(invoice as any, settings);
      const dataUrl = `data:application/pdf;base64,${pdfBuffer.toString('base64')}`;

      prisma.invoice
        .update({ where: { id }, data: { pdfUrl: dataUrl } })
        .catch((e) => console.error('Portal PDF cache write failed:', e));

      return streamPdf(pdfBuffer, invoice.invoiceNumber);
    } catch (error: any) {
      console.error('Portal PDF error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to generate PDF' },
        { status: 500 }
      );
    }
  }
);
