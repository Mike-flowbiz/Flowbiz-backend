import { NextRequest, NextResponse } from 'next/server';
import { authenticate, createAuthResponse, createAuthzResponse } from '@/lib/middleware/auth';
import { parseFileField, validateReceiptFile, fileToBuffer } from '@/lib/middleware/upload';
import { uploadReceipt, isS3Configured } from '@/backend/utils/s3';
import { savePublicUpload } from '@/backend/utils/localUpload';

export async function POST(request: NextRequest) {
  const authResult = authenticate(request);
  if (!authResult) {
    return createAuthResponse('Authentication required');
  }
  if (!['ADMIN', 'CONTRACTOR'].includes(authResult.user.role)) {
    return createAuthzResponse();
  }

  try {
    const { file } = await parseFileField(request, 'receipt');
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    const validation = validateReceiptFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const buffer = await fileToBuffer(file);
    const receiptUrl = isS3Configured()
      ? await uploadReceipt(buffer, file.name, file.type)
      : await savePublicUpload(buffer, 'receipts', file.name);

    return NextResponse.json({
      message: 'Receipt uploaded successfully',
      url: receiptUrl,
      storage: isS3Configured() ? 's3' : 'local',
    });
  } catch (error: any) {
    console.error('Receipt upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload receipt' },
      { status: 500 }
    );
  }
}
