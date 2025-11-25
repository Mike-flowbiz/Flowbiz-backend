import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { uploadLogo as uploadLogoMiddleware, uploadReceipt as uploadReceiptMiddleware } from '../middleware/upload';
import { uploadLogo, uploadReceipt, isS3Configured } from '../utils/s3';

const router = Router();

router.use(authenticate);

// Check S3 configuration status
router.get('/status', (req: Request, res: Response) => {
  const configured = isS3Configured();
  res.json({
    s3Configured: configured,
    message: configured
      ? 'AWS S3 is configured and ready'
      : 'AWS S3 is not configured. Please set AWS credentials in .env',
  });
});

// Upload company logo
router.post('/logo', authorize('ADMIN'), uploadLogoMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isS3Configured()) {
      return res.status(503).json({ error: 'S3 is not configured' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const logoUrl = await uploadLogo(req.file.buffer, req.file.originalname, req.file.mimetype);

    res.json({
      message: 'Logo uploaded successfully',
      url: logoUrl,
    });
  } catch (error: any) {
    console.error('Logo upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload logo' });
  }
});

// Upload expense receipt
router.post('/receipt', authorize('ADMIN', 'CONTRACTOR'), uploadReceiptMiddleware, async (req: Request, res: Response) => {
  try {
    if (!isS3Configured()) {
      return res.status(503).json({ error: 'S3 is not configured' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const receiptUrl = await uploadReceipt(req.file.buffer, req.file.originalname, req.file.mimetype);

    res.json({
      message: 'Receipt uploaded successfully',
      url: receiptUrl,
    });
  } catch (error: any) {
    console.error('Receipt upload error:', error);
    res.status(500).json({ error: error.message || 'Failed to upload receipt' });
  }
});

export default router;

