import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        client: { select: { name: true, email: true } },
        invoiceItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

// Get single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        client: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        invoiceItems: { include: { product: true } },
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ invoice });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
});

// Create invoice (placeholder - full implementation in Milestone 6)
router.post('/', authorize('ADMIN', 'CONTRACTOR'), async (req, res) => {
  try {
    res.status(501).json({ message: 'Invoice creation will be implemented in Milestone 6' });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

export default router;

