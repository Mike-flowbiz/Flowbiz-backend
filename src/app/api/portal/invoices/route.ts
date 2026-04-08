import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuthz } from '@/lib/middleware/auth';

// GET /api/portal/invoices - List invoices for the logged-in CLIENT user
// Matches by user email → client record email
export const GET = withAuthz(['CLIENT'], async (request: NextRequest, user) => {
  try {
    const client = await prisma.client.findUnique({ where: { email: user.email } });

    if (!client) {
      return NextResponse.json(
        { error: 'No client account found for this email address.' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { clientId: client.id };
    if (status) where.status = status;

    const invoices = await prisma.invoice.findMany({
      where,
      include: { invoiceItems: true },
      orderBy: { issueDate: 'desc' },
    });

    return NextResponse.json({ invoices, client });
  } catch (error) {
    console.error('Portal invoices error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
});
