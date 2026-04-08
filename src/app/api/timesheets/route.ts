import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withAuthz } from '@/lib/middleware/auth';

// GET /api/timesheets - List timesheets for the current user
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = { userId: user.id };

    if (clientId) where.clientId = clientId;
    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) dateFilter.lte = new Date(endDate);
      where.date = dateFilter;
    }

    const timesheets = await prisma.timesheet.findMany({
      where,
      include: { client: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    });

    const totalHours = timesheets
      .filter((t) => !t.isTimerMode || t.endTime)
      .reduce((sum, t) => sum + t.hours, 0);

    return NextResponse.json({ timesheets, totalHours: Math.round(totalHours * 100) / 100 });
  } catch (error) {
    console.error('Get timesheets error:', error);
    return NextResponse.json({ error: 'Failed to fetch timesheets' }, { status: 500 });
  }
});

// POST /api/timesheets - Create a manual entry or start a timer
export const POST = withAuthz(['ADMIN', 'CONTRACTOR'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { clientId, description, date, hours, isTimerMode } = body;

    if (isTimerMode) {
      const timesheet = await prisma.timesheet.create({
        data: {
          userId: user.id,
          clientId: clientId || null,
          description: description?.trim() || null,
          date: new Date(),
          hours: 0,
          isTimerMode: true,
          startTime: new Date(),
        },
        include: { client: { select: { id: true, name: true } } },
      });
      return NextResponse.json({ message: 'Timer started', timesheet }, { status: 201 });
    }

    const parsedHours = parseFloat(hours);
    if (hours === undefined || hours === null || isNaN(parsedHours) || parsedHours <= 0) {
      return NextResponse.json(
        { error: 'Hours must be a positive number' },
        { status: 400 }
      );
    }

    const timesheet = await prisma.timesheet.create({
      data: {
        userId: user.id,
        clientId: clientId || null,
        description: description?.trim() || null,
        date: date ? new Date(date) : new Date(),
        hours: parsedHours,
        isTimerMode: false,
      },
      include: { client: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ message: 'Time logged', timesheet }, { status: 201 });
  } catch (error) {
    console.error('Create timesheet error:', error);
    return NextResponse.json({ error: 'Failed to create timesheet entry' }, { status: 500 });
  }
});
