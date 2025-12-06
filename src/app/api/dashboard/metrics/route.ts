import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/middleware/auth';

export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Current month revenue
    const currentMonthRevenue = await prisma.invoice.aggregate({
      where: {
        status: 'PAID',
        paidAt: { gte: startOfMonth },
      },
      _sum: { total: true },
    });

    // Last month revenue
    const lastMonthRevenue = await prisma.invoice.aggregate({
      where: {
        status: 'PAID',
        paidAt: { gte: startOfLastMonth, lte: endOfLastMonth },
      },
      _sum: { total: true },
    });

    // Pending invoices
    const pendingInvoices = await prisma.invoice.aggregate({
      where: { status: { in: ['SENT', 'OVERDUE'] } },
      _sum: { total: true },
      _count: true,
    });

    // Overdue invoices
    const overdueInvoices = await prisma.invoice.count({
      where: {
        status: 'OVERDUE',
        dueDate: { lt: now },
      },
    });

    // Total clients
    const totalClients = await prisma.client.count({
      where: { isActive: true },
    });

    return NextResponse.json({
      currentMonthRevenue: currentMonthRevenue._sum.total || 0,
      lastMonthRevenue: lastMonthRevenue._sum.total || 0,
      pendingAmount: pendingInvoices._sum.total || 0,
      pendingCount: pendingInvoices._count,
      overdueCount: overdueInvoices,
      totalClients,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
});
