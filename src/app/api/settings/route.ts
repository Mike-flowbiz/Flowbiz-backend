import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withAuthz } from '@/lib/middleware/auth';

// GET /api/settings - Get business settings
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const settings = await prisma.businessSettings.findFirst();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
});

// PUT /api/settings - Update settings (placeholder)
export const PUT = withAuthz(['ADMIN'], async (request: NextRequest, user) => {
  try {
    return NextResponse.json(
      { message: 'Settings update will be fully implemented in Milestone 5' },
      { status: 501 }
    );
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
});
