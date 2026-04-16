import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { isS3Configured } from '@/backend/utils/s3';

export const GET = withAuth(async (request: NextRequest, user) => {
  const s3 = isS3Configured();
  return NextResponse.json({
    s3Configured: s3,
    active: s3 ? 's3' : 'base64',
    message: s3
      ? 'AWS S3 is configured and ready'
      : 'Uploads are stored as base64 in the database (no cloud storage configured).',
  });
});
