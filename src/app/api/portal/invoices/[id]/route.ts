import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuthz } from '@/lib/middleware/auth';

// GET /api/portal/invoices/[id] - Get single invoice for a CLIENT user
export const GET = withAuthz(
  ['CLIENT'],
  async (request: NextRequest, user, { params }) => {
    const { id } = await params;

    try {
      const client = await prisma.client.findUnique({ where: { email: user.email } });

      if (!client) {
        return NextResponse.json(
          { error: 'No client account found for this email address.' },
          { status: 404 }
        );
      }

      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { invoiceItems: { include: { product: true } } },
      });

      if (!invoice || invoice.clientId !== client.id) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }

      return NextResponse.json({ invoice, client });
    } catch (error) {
      console.error('Portal invoice detail error:', error);
      return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }
  }
);
