import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuthz } from '@/lib/middleware/auth';

// PUT /api/timesheets/[id] - Update a timesheet entry or stop a running timer
export const PUT = withAuthz(
  ['ADMIN', 'CONTRACTOR'],
  async (request: NextRequest, user, { params }) => {
    const { id } = await params;
    try {
      const existing = await prisma.timesheet.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: 'Timesheet entry not found' }, { status: 404 });
      }
      if (existing.userId !== user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }

      const body = await request.json();
      const { clientId, description, date, hours, stopTimer } = body;

      // Stop a running timer: compute hours from startTime → now
      if (stopTimer && existing.isTimerMode && !existing.endTime) {
        const endTime = new Date();
        const diffMs = endTime.getTime() - existing.startTime!.getTime();
        const computedHours = Math.max(Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100, 0.01);

        const timesheet = await prisma.timesheet.update({
          where: { id },
          data: { endTime, hours: computedHours },
          include: { client: { select: { id: true, name: true } } },
        });
        return NextResponse.json({ message: 'Timer stopped', timesheet });
      }

      const updateData: Record<string, unknown> = {};
      if (clientId !== undefined) updateData.clientId = clientId || null;
      if (description !== undefined) updateData.description = description?.trim() || null;
      if (date !== undefined) updateData.date = new Date(date);
      if (hours !== undefined) {
        const parsedHours = parseFloat(hours);
        if (isNaN(parsedHours) || parsedHours <= 0) {
          return NextResponse.json({ error: 'Hours must be a positive number' }, { status: 400 });
        }
        updateData.hours = parsedHours;
      }

      const timesheet = await prisma.timesheet.update({
        where: { id },
        data: updateData,
        include: { client: { select: { id: true, name: true } } },
      });
      return NextResponse.json({ message: 'Timesheet updated', timesheet });
    } catch (error: unknown) {
      console.error('Update timesheet error:', error);
      const err = error as { code?: string };
      if (err.code === 'P2025') {
        return NextResponse.json({ error: 'Timesheet entry not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update timesheet entry' }, { status: 500 });
    }
  }
);

// DELETE /api/timesheets/[id]
export const DELETE = withAuthz(
  ['ADMIN', 'CONTRACTOR'],
  async (request: NextRequest, user, { params }) => {
    const { id } = await params;
    try {
      const existing = await prisma.timesheet.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ error: 'Timesheet entry not found' }, { status: 404 });
      }
      if (existing.userId !== user.id) {
        return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
      }

      await prisma.timesheet.delete({ where: { id } });
      return NextResponse.json({ message: 'Timesheet entry deleted' });
    } catch (error: unknown) {
      console.error('Delete timesheet error:', error);
      const err = error as { code?: string };
      if (err.code === 'P2025') {
        return NextResponse.json({ error: 'Timesheet entry not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to delete timesheet entry' }, { status: 500 });
    }
  }
);
