import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withAuthz } from '@/lib/middleware/auth';
import { InvoiceStatus } from '@prisma/client';

async function getNextInvoiceNumber(): Promise<string> {
  const invoices = await prisma.invoice.findMany({
    select: { invoiceNumber: true },
    orderBy: { createdAt: 'desc' },
  });
  let maxNum = 0;
  for (const inv of invoices) {
    const match = inv.invoiceNumber.match(/^INV-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const next = maxNum + 1;
  return `INV-${String(next).padStart(4, '0')}`;
}

async function getVatRate(): Promise<number> {
  const settings = await prisma.businessSetting.findFirst();
  return settings?.vatRate ?? 20;
}

// GET /api/invoices - Get all invoices (optional: status, clientId)
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const clientId = searchParams.get('clientId');

    const where: { status?: InvoiceStatus; clientId?: string } = {};
    if (status && Object.values(InvoiceStatus).includes(status as InvoiceStatus)) {
      where.status = status as InvoiceStatus;
    }
    if (clientId) where.clientId = clientId;

    const invoices = await prisma.invoice.findMany({
      where,
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

// POST /api/invoices - Create invoice with auto numbering and VAT
export const POST = withAuthz(['ADMIN', 'CONTRACTOR'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { clientId, dueDate, notes, items } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client is required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one line item is required' },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({ where: { id: clientId } });
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 400 }
      );
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.description?.trim?.()) {
        return NextResponse.json(
          { error: `Line ${i + 1}: description is required` },
          { status: 400 }
        );
      }
      const qty = Number(item.quantity);
      const price = Number(item.unitPrice);
      if (isNaN(qty) || qty <= 0) {
        return NextResponse.json(
          { error: `Line ${i + 1}: quantity must be a positive number` },
          { status: 400 }
        );
      }
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { error: `Line ${i + 1}: unit price must be zero or greater` },
          { status: 400 }
        );
      }
    }

    const vatRate = await getVatRate();
    const invoiceNumber = await getNextInvoiceNumber();

    const lineItems = items.map((item: { productId?: string; description: string; quantity: number; unitPrice: number }) => {
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unitPrice);
      const amount = Math.round(quantity * unitPrice * 100) / 100;
      return {
        productId: item.productId || null,
        description: String(item.description).trim(),
        quantity,
        unitPrice,
        amount,
      };
    });

    const subtotal = Math.round(lineItems.reduce((sum: number, i: { amount: number }) => sum + i.amount, 0) * 100) / 100;
    const vatAmount = Math.round(subtotal * (vatRate / 100) * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;

    const issueDate = new Date();
    const due = dueDate
      ? new Date(dueDate)
      : (() => {
          const d = new Date(issueDate);
          d.setDate(d.getDate() + 30);
          return d;
        })();

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        userId: user.id,
        issueDate,
        dueDate: due,
        status: InvoiceStatus.DRAFT,
        subtotal,
        vatAmount,
        vatRate,
        total,
        notes: notes?.trim?.() || null,
        invoiceItems: {
          create: lineItems,
        },
      },
      include: {
        client: { select: { name: true, email: true } },
        invoiceItems: { include: { product: true } },
      },
    });

    return NextResponse.json(
      { message: 'Invoice created', invoice },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
});
