import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get dashboard metrics
router.get('/metrics', async (req, res) => {
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

    res.json({
      currentMonthRevenue: currentMonthRevenue._sum.total || 0,
      lastMonthRevenue: lastMonthRevenue._sum.total || 0,
      pendingAmount: pendingInvoices._sum.total || 0,
      pendingCount: pendingInvoices._count,
      overdueCount: overdueInvoices,
      totalClients,
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get recent activities
router.get('/activities', async (req, res) => {
  try {
    const recentInvoices = await prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { name: true } } },
    });

    const recentClients = await prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      recentInvoices,
      recentClients,
    });
  } catch (error) {
    console.error('Dashboard activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get monthly revenue chart data (last 6 months)
router.get('/revenue-chart', async (req, res) => {
  try {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const revenue = await prisma.invoice.aggregate({
        where: {
          status: 'PAID',
          paidAt: { gte: date, lt: nextMonth },
        },
        _sum: { total: true },
      });

      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: revenue._sum.total || 0,
      });
    }

    res.json({ data: months });
  } catch (error) {
    console.error('Revenue chart error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue data' });
  }
});

export default router;

