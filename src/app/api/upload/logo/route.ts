import { NextRequest, NextResponse } from 'next/server';
import { authenticate, createAuthResponse, createAuthzResponse } from '@/lib/middleware/auth';
import { parseFileField, validateImageFile, fileToBuffer } from '@/lib/middleware/upload';
import { uploadLogo, isS3Configured } from '@/backend/utils/s3';
import { savePublicUpload } from '@/backend/utils/localUpload';

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

    const buffer = await fileToBuffer(file);
    const logoUrl = isS3Configured()
      ? await uploadLogo(buffer, file.name, file.type)
      : await savePublicUpload(buffer, 'logos', file.name);

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      url: logoUrl,
      storage: isS3Configured() ? 's3' : 'local',
    });
  } catch (error: any) {
    console.error('Logo upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload logo' },
      { status: 500 }
    );
  }
}
