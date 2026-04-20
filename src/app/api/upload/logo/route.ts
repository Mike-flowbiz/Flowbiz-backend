import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { authenticate, createAuthResponse, createAuthzResponse } from '@/lib/middleware/auth';
import { parseFileField, validateImageFile, fileToBuffer } from '@/lib/middleware/upload';
import { uploadLogo, isS3Configured } from '@/backend/utils/s3';

export async function POST(request: NextRequest) {
  const authResult = authenticate(request);
  if (!authResult) {
    return createAuthResponse('Authentication required');
  }
  if (authResult.user.role !== 'ADMIN') {
    return createAuthzResponse();
  }

  try {
    const { file } = await parseFileField(request, 'logo');
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const rawBuffer = await fileToBuffer(file);

    // Resize to a bounded size so the logo doesn't bloat PDFs/emails.
    // Logo renders at ~45mm wide in the invoice PDF, so 400px is plenty for print/retina.
    const isPng = file.type === 'image/png';
    const pipeline = sharp(rawBuffer).resize({
      width: 100,
      height: 100,
      fit: 'inside',
      withoutEnlargement: true,
    });
    const resizedBuffer = isPng
      ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
      : await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    const resizedMime = isPng ? 'image/png' : 'image/jpeg';

    let logoUrl: string;
    let storage: 's3' | 'base64';
    if (isS3Configured()) {
      logoUrl = await uploadLogo(resizedBuffer, file.name, resizedMime);
      storage = 's3';
    } else {
      logoUrl = `data:${resizedMime};base64,${resizedBuffer.toString('base64')}`;
      storage = 'base64';
    }

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      url: logoUrl,
      storage,
    });
  } catch (error: any) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload logo' },
      { status: 500 }
    );
  }
}
