import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { withAuthz } from '@/lib/middleware/auth';
import { UserRole } from '@prisma/client';
import { sendEmail, buildClientWelcomeEmail } from '@/backend/utils/email';

// GET /api/users - List all users (ADMIN only)
export const GET = withAuthz([UserRole.ADMIN], async () => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: { select: { invoices: true, expenses: true, timesheets: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
});

// POST /api/users - Create user (ADMIN only)
export const POST = withAuthz([UserRole.ADMIN], async (request: NextRequest) => {
  try {
    const { email, password, firstName, lastName, role } = await request.json();

    if (!email?.trim() || !password || !firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.CONTRACTOR, UserRole.CLIENT];
    const assignedRole: UserRole = allowedRoles.includes(role) ? role : UserRole.CONTRACTOR;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedEmail = email.trim().toLowerCase();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          role: assignedRole,
        },
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

      if (assignedRole === UserRole.CLIENT) {
        await tx.client.upsert({
          where: { email: normalizedEmail },
          update: {},
          create: {
            email: normalizedEmail,
            name: `${trimmedFirstName} ${trimmedLastName}`,
          },
        });
      }

      return created;
    });

    let emailWarning: string | undefined;
    if (assignedRole === UserRole.CLIENT) {
      try {
        const settings = await prisma.businessSetting.findFirst();
        const companyName = settings?.companyName || 'FlowBiz';
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const html = buildClientWelcomeEmail({
          firstName: trimmedFirstName,
          email: normalizedEmail,
          password,
          loginUrl: `${appUrl}/login`,
          companyName,
          primaryColor: settings?.primaryColor,
        });
        await sendEmail({
          to: normalizedEmail,
          subject: `Your ${companyName} client portal access`,
          html,
        });
      } catch (emailError) {
        console.error('Client welcome email error:', emailError);
        emailWarning =
          'Client user created, but the welcome email failed to send. Share the credentials manually.';
      }
    }

    return NextResponse.json(
      emailWarning ? { message: 'User created', user, warning: emailWarning } : { message: 'User created', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
});
