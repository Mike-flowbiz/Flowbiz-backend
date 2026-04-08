import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withAuthz } from '@/lib/middleware/auth';
import { ExpenseCategory } from '@prisma/client';

// GET /api/expenses - List expenses for the current user
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = { userId: user.id };

    if (category && Object.values(ExpenseCategory).includes(category as ExpenseCategory)) {
      where.category = category as ExpenseCategory;
    }
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      where.date = dateFilter;
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const total = Math.round(expenses.reduce((sum, e) => sum + e.amount, 0) * 100) / 100;

    return NextResponse.json({ expenses, total });
  } catch (error) {
    console.error('Get expenses error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
});

// POST /api/expenses - Create an expense
export const POST = withAuthz(['ADMIN', 'CONTRACTOR'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { date, amount, category, description, receiptUrl } = body;

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    if (amount === undefined || amount === null || isNaN(parsedAmount) || parsedAmount < 0) {
      return NextResponse.json({ error: 'Amount must be a non-negative number' }, { status: 400 });
    }

    const resolvedCategory =
      category && Object.values(ExpenseCategory).includes(category as ExpenseCategory)
        ? (category as ExpenseCategory)
        : ExpenseCategory.OTHER;

    const expense = await prisma.expense.create({
      data: {
        userId: user.id,
        date: date ? new Date(date) : new Date(),
        amount: parsedAmount,
        category: resolvedCategory,
        description: description.trim(),
        receiptUrl: receiptUrl || null,
      },
    });

    return NextResponse.json({ message: 'Expense created', expense }, { status: 201 });
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
});
