import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { isS3Configured } from '@/backend/utils/s3';
import { isBlobConfigured } from '@/backend/utils/blobUpload';

export const GET = withAuth(async (request: NextRequest, user) => {
  const s3 = isS3Configured();
  const blob = isBlobConfigured();
  const active = s3 ? 's3' : blob ? 'blob' : 'local';
  const message =
    active === 's3'
      ? 'AWS S3 is configured and ready'
      : active === 'blob'
        ? 'Vercel Blob is configured and ready'
        : 'No cloud storage configured. Local upload fallback is active (not writable on Vercel).';
  return NextResponse.json({
    s3Configured: s3,
    blobConfigured: blob,
    active,
    localFallbackEnabled: !s3 && !blob,
    message,
  });
});
