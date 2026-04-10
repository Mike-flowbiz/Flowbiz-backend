import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuthz } from '@/lib/middleware/auth';
import { UserRole } from '@prisma/client';

// PUT /api/users/[id] - Update user role/name (ADMIN only)
export const PUT = withAuthz(
  [UserRole.ADMIN],
  async (request: NextRequest, user, context) => {
    try {
      const { id } = await context.params;
      const { firstName, lastName, role } = await request.json();

      const target = await prisma.user.findUnique({ where: { id } });
      if (!target) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const updateData: { firstName?: string; lastName?: string; role?: UserRole } = {};

      if (firstName?.trim()) updateData.firstName = firstName.trim();
      if (lastName?.trim()) updateData.lastName = lastName.trim();

      const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.CONTRACTOR, UserRole.CLIENT];
      if (role && allowedRoles.includes(role)) {
        // Prevent demoting the last admin
        if (target.role === UserRole.ADMIN && role !== UserRole.ADMIN) {
          const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } });
          if (adminCount <= 1) {
            return NextResponse.json(
              { error: 'Cannot change role — at least one admin must remain' },
              { status: 400 }
            );
          }
        }
        updateData.role = role;
      }

      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          _count: { select: { invoices: true, expenses: true, timesheets: true } },
        },
      });

      return NextResponse.json({ message: 'User updated', user: updated });
    } catch (error: unknown) {
      console.error('Update user error:', error);
      const err = error as { code?: string };
      if (err.code === 'P2025') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
  }
);

// DELETE /api/users/[id] - Delete user (ADMIN only, cannot delete self)
export const DELETE = withAuthz(
  [UserRole.ADMIN],
  async (_request: NextRequest, user, context) => {
    try {
      const { id } = await context.params;

      if (id === user.id) {
        return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
      }

      const target = await prisma.user.findUnique({ where: { id } });
      if (!target) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Prevent deleting the last admin
      if (target.role === UserRole.ADMIN) {
        const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } });
        if (adminCount <= 1) {
          return NextResponse.json(
            { error: 'Cannot delete the last admin account' },
            { status: 400 }
          );
        }
      }

      await prisma.user.delete({ where: { id } });
      return NextResponse.json({ message: 'User deleted' });
    } catch (error: unknown) {
      console.error('Delete user error:', error);
      const err = error as { code?: string };
      if (err.code === 'P2025') {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
  }
);
