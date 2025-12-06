import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withAuthz } from '@/lib/middleware/auth';

// GET /api/invoices - Get all invoices
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: { select: { name: true, email: true } },
        invoiceItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
});

// POST /api/invoices - Create invoice (placeholder)
export const POST = withAuthz(['ADMIN', 'CONTRACTOR'], async (request: NextRequest, user) => {
  try {
    return NextResponse.json(
      { message: 'Invoice creation will be implemented in Milestone 6' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
});
