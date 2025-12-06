import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

// GET /api/timesheets - Get timesheets (placeholder)
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    return NextResponse.json({
      timesheets: [],
      message: 'Timesheets will be implemented in Milestone 8',
    });
  } catch (error) {
    console.error('Get timesheets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timesheets' },
      { status: 500 }
    );
  }
});
