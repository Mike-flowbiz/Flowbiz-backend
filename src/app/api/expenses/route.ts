import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

// GET /api/expenses - Get expenses (placeholder)
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    return NextResponse.json({
      expenses: [],
      message: 'Expenses will be implemented in Milestone 8',
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
});
