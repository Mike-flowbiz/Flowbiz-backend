import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, createAuthResponse } from '@/lib/middleware/auth';
import { InvoiceStatus } from '@prisma/client';

async function getVatRate(): Promise<number> {
  const settings = await prisma.businessSetting.findFirst();
  return settings?.vatRate ?? 20;
}

// GET /api/invoices/[id] - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = authenticate(request);
  if (!authResult) {
    return createAuthResponse('Authentication required');
  }

  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        client: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        invoiceItems: { include: { product: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Ensure the invoice belongs to the authenticated user
    if (invoice.userId !== authResult.user.id) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT /api/invoices/[id] - Update invoice (recalculate totals from items)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = authenticate(request);
  if (!authResult) {
    return createAuthResponse('Authentication required');
  }
  if (!['ADMIN', 'CONTRACTOR'].includes(authResult.user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.invoice.findUnique({
      where: { id },
      include: { invoiceItems: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { clientId, dueDate, notes, status, items } = body;

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json(
          { error: 'At least one line item is required' },
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
        if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) {
          return NextResponse.json(
            { error: `Line ${i + 1}: invalid quantity or unit price` },
            { status: 400 }
          );
        }
      }
    }

    const vatRate = await getVatRate();

    const updateData: {
      clientId?: string;
      dueDate?: Date;
      notes?: string | null;
      status?: InvoiceStatus;
      subtotal?: number;
      vatAmount?: number;
      vatRate?: number;
      total?: number;
    } = {};

    if (clientId !== undefined) updateData.clientId = clientId;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (notes !== undefined) updateData.notes = notes?.trim?.() || null;
    if (status !== undefined && Object.values(InvoiceStatus).includes(status)) {
      updateData.status = status as InvoiceStatus;
      if (status === 'PAID') {
        (updateData as any).paidAt = new Date();
      } else if (existing.status === 'PAID' && status !== 'PAID') {
        (updateData as any).paidAt = null;
      }
    }

    if (items !== undefined) {
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
      updateData.subtotal = subtotal;
      updateData.vatAmount = vatAmount;
      updateData.vatRate = vatRate;
      updateData.total = total;

      await prisma.invoiceItem.deleteMany({ where: { invoiceId: id } });
      await prisma.invoiceItem.createMany({
        data: lineItems.map((item: { productId: string | null; description: string; quantity: number; unitPrice: number; amount: number }) => ({
          invoiceId: id,
          productId: item.productId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: item.amount,
        })),
      });
    }

    const invoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { name: true, email: true } },
        invoiceItems: { include: { product: true } },
      },
    });

    return NextResponse.json({ message: 'Invoice updated', invoice });
  } catch (error: unknown) {
    console.error('Update invoice error:', error);
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE /api/invoices/[id] - Delete invoice (InvoiceItem has onDelete: Cascade in schema, so items are removed by DB)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authResult = authenticate(request);
  if (!authResult) {
    return createAuthResponse('Authentication required');
  }
  if (!['ADMIN', 'CONTRACTOR'].includes(authResult.user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const { id } = await params;
    // Prisma cascade: InvoiceItem.invoice has onDelete: Cascade, so invoiceItems are deleted automatically
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ message: 'Invoice deleted' });
  } catch (error: unknown) {
    console.error('Delete invoice error:', error);
    const err = error as { code?: string };
    if (err.code === 'P2025') {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}
