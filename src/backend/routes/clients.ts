import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Get all clients
router.get('/', async (req, res) => {
  try {
    const { search, isActive } = req.query;

    const clients = await prisma.client.findMany({
      where: {
        ...(search && {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } },
            { companyName: { contains: search as string, mode: 'insensitive' } },
          ],
        }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ clients });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Get single client
router.get('/:id', async (req, res) => {
  try {
    const client = await prisma.client.findUnique({
      where: { id: req.params.id },
      include: {
        invoices: { orderBy: { createdAt: 'desc' }, take: 10 },
        timesheets: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ client });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to fetch client' });
  }
});

// Create client
router.post('/', authorize('ADMIN', 'CONTRACTOR'), async (req, res) => {
  try {
    const { name, email, phone, address, companyName, vatNumber, notes } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const client = await prisma.client.create({
      data: { name, email, phone, address, companyName, vatNumber, notes },
    });

    res.status(201).json({ message: 'Client created', client });
  } catch (error: any) {
    console.error('Create client error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create client' });
  }
});

// Update client
router.put('/:id', authorize('ADMIN', 'CONTRACTOR'), async (req, res) => {
  try {
    const { name, email, phone, address, companyName, vatNumber, notes, isActive } = req.body;

    const client = await prisma.client.update({
      where: { id: req.params.id },
      data: { name, email, phone, address, companyName, vatNumber, notes, isActive },
    });

    res.json({ message: 'Client updated', client });
  } catch (error: any) {
    console.error('Update client error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// Delete client
router.delete('/:id', authorize('ADMIN', 'CONTRACTOR'), async (req, res) => {
  try {
    await prisma.client.delete({ where: { id: req.params.id } });
    res.json({ message: 'Client deleted' });
  } catch (error: any) {
    console.error('Delete client error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

export default router;

