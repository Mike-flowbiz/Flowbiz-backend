import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuthz } from '@/lib/middleware/auth';
import { generateInvoicePDF } from '@/backend/utils/pdf';
import { uploadInvoicePDF, isS3Configured } from '@/backend/utils/s3';

// POST /api/invoices/[id]/pdf - Generate PDF, upload to S3, and update invoice
export const POST = withAuthz(['ADMIN', 'CONTRACTOR'], async (request: NextRequest, user, { params }) => {
    const { id } = await params;

    try {
        // 1. Fetch invoice with details
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                client: true,
                invoiceItems: {
                    include: { product: true },
                },
            },
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // 2. Fetch business settings for branding
        const settings = await prisma.businessSetting.findFirst();

        // 3. Generate PDF Buffer
        const pdfBuffer = await generateInvoicePDF(invoice as any, settings);

        // 4. Check S3 configuration for storage
        if (isS3Configured()) {
            try {
                // Upload to S3
                const pdfUrl = await uploadInvoicePDF(pdfBuffer, invoice.invoiceNumber);

                // Update invoice with PDF URL
                await prisma.invoice.update({
                    where: { id },
                    data: { pdfUrl },
                });

                return NextResponse.json({
                    message: 'PDF generated and uploaded successfully',
                    pdfUrl,
                });
            } catch (uploadError) {
                console.warn('S3 upload failed, falling back to direct stream:', uploadError);
            }
        }

        // 5. Fallback: Stream PDF directly if S3 is not configured or upload fails
        // Convert Buffer to Uint8Array to satisfy BodyInit
        const pdfStream = new Uint8Array(pdfBuffer);
        return new NextResponse(pdfStream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="invoice-${invoice.invoiceNumber}.pdf"`,
            },
        });
    } catch (error: any) {
        console.error('PDF generation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate PDF' },
            { status: 500 }
        );
    }
});


// GET /api/invoices/[id]/pdf - Redirect to PDF URL or generate if missing
export const GET = withAuthz(['ADMIN', 'CONTRACTOR'], async (request: NextRequest, user, { params }) => {
    const { id } = await params;

    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            select: { pdfUrl: true },
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (invoice.pdfUrl) {
            return NextResponse.redirect(new URL(invoice.pdfUrl));
        }

        return NextResponse.json({ error: 'PDF not yet generated' }, { status: 404 });
    } catch (error: any) {
        console.error('Get PDF error:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve PDF' },
            { status: 500 }
        );
    }
});
