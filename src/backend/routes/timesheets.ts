import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get timesheets (placeholder for Milestone 8)
router.get('/', async (req, res) => {
  try {
    res.json({ timesheets: [], message: 'Timesheets will be implemented in Milestone 8' });
  } catch (error) {
    console.error('Get timesheets error:', error);
    res.status(500).json({ error: 'Failed to fetch timesheets' });
  }
});

export default router;

