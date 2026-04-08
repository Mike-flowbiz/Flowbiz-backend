import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuthz } from '@/lib/middleware/auth';
import { ExpenseCategory } from '@prisma/client';

// PUT /api/expenses/[id] - Update an expense
export const PUT = withAuthz(
  ['ADMIN', 'CONTRACTOR'],
  async (request: NextRequest, user, { params }) => {
    const { id } = await params;
    try {
      const existing = await prisma.expense.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }
      if (existing.userId !== user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }

      const body = await request.json();
      const { date, amount, category, description, receiptUrl } = body;

      const updateData: Record<string, unknown> = {};

      if (date !== undefined) updateData.date = new Date(date);

      if (amount !== undefined) {
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
          return NextResponse.json(
            { error: 'Amount must be a non-negative number' },
            { status: 400 }
          );
        }
        updateData.amount = parsedAmount;
      }

      if (category !== undefined) {
        if (Object.values(ExpenseCategory).includes(category as ExpenseCategory)) {
          updateData.category = category as ExpenseCategory;
        } else {
          return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
        }
      }

      if (description !== undefined) {
        if (!description?.trim()) {
          return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }
        updateData.description = description.trim();
      }

      if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl || null;

      const expense = await prisma.expense.update({ where: { id }, data: updateData });
      return NextResponse.json({ message: 'Expense updated', expense });
    } catch (error: unknown) {
      console.error('Update expense error:', error);
      const err = error as { code?: string };
      if (err.code === 'P2025') {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
    }
  }
);

// DELETE /api/expenses/[id]
export const DELETE = withAuthz(
  ['ADMIN', 'CONTRACTOR'],
  async (request: NextRequest, user, { params }) => {
    const { id } = await params;
    try {
      const existing = await prisma.expense.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }
      if (existing.userId !== user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }

      await prisma.expense.delete({ where: { id } });
      return NextResponse.json({ message: 'Expense deleted' });
    } catch (error: unknown) {
      console.error('Delete expense error:', error);
      const err = error as { code?: string };
      if (err.code === 'P2025') {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
    }
  }
);
