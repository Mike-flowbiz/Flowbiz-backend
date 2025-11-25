import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get expenses (placeholder for Milestone 8)
router.get('/', async (req, res) => {
  try {
    res.json({ expenses: [], message: 'Expenses will be implemented in Milestone 8' });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

export default router;

