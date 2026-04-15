import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, withAuthz } from '@/lib/middleware/auth';

// GET /api/settings - Get business settings
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const settings = await prisma.businessSetting.findFirst();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
});

// PUT /api/settings - Update settings
export const PUT = withAuthz(['ADMIN'], async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const {
      companyName,
      companyEmail,
      companyPhone,
      companyAddress,
      vatNumber,
      vatRate,
      logo,
      primaryColor,
      secondaryColor,
      bankName,
      accountNumber,
      sortCode,
      smtpHost,
      smtpPort,
      smtpSecure,
      smtpUser,
      smtpPass,
      smtpFrom,
    } = body;

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    if (vatRate !== undefined && (vatRate < 0 || vatRate > 100)) {
      return NextResponse.json(
        { error: 'VAT rate must be between 0 and 100' },
        { status: 400 }
      );
    }

    // Find existing settings or create new
    const existing = await prisma.businessSetting.findFirst();
    
    const smtpData = {
      ...(smtpHost !== undefined ? { smtpHost: smtpHost || null } : {}),
      ...(smtpPort !== undefined ? { smtpPort: smtpPort || '587' } : {}),
      ...(smtpSecure !== undefined ? { smtpSecure: !!smtpSecure } : {}),
      ...(smtpUser !== undefined ? { smtpUser: smtpUser || null } : {}),
      ...(smtpPass !== undefined ? { smtpPass: smtpPass || null } : {}),
      ...(smtpFrom !== undefined ? { smtpFrom: smtpFrom || null } : {}),
    };

    const settings = existing
      ? await prisma.businessSetting.update({
          where: { id: existing.id },
          data: {
            companyName,
            companyEmail,
            companyPhone,
            companyAddress,
            vatNumber,
            vatRate: vatRate ?? existing.vatRate,
            logo,
            primaryColor: primaryColor ?? existing.primaryColor,
            secondaryColor: secondaryColor ?? existing.secondaryColor,
            bankName,
            accountNumber,
            sortCode,
            ...smtpData,
          },
        })
      : await prisma.businessSetting.create({
          data: {
            companyName,
            companyEmail,
            companyPhone,
            companyAddress,
            vatNumber,
            vatRate: vatRate ?? 20.0,
            logo,
            primaryColor: primaryColor ?? '#3B82F6',
            secondaryColor: secondaryColor ?? '#1E40AF',
            bankName,
            accountNumber,
            sortCode,
            ...smtpData,
          },
        });

    return NextResponse.json({ message: 'Settings updated', settings });
  } catch (error: any) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
});
