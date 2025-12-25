import { Router } from 'express';
import { prisma } from '../../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

// Get business settings
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.businessSetting.findFirst();
    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings (will be fully implemented in Milestone 5)
router.put('/', authorize('ADMIN'), async (req, res) => {
  try {
    res.status(501).json({ message: 'Settings update will be fully implemented in Milestone 5' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;

