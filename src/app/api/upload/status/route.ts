import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { isS3Configured } from '@/backend/utils/s3';

export const GET = withAuth(async (request: NextRequest, user) => {
  const configured = isS3Configured();
  return NextResponse.json({
    s3Configured: configured,
    message: configured
      ? 'AWS S3 is configured and ready'
      : 'AWS S3 is not configured. Please set AWS credentials in .env',
  });
});
