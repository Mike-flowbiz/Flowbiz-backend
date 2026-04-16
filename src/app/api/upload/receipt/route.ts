import { NextRequest, NextResponse } from 'next/server';
import { authenticate, createAuthResponse, createAuthzResponse } from '@/lib/middleware/auth';
import { parseFileField, validateReceiptFile, fileToBuffer } from '@/lib/middleware/upload';
import { uploadReceipt, isS3Configured } from '@/backend/utils/s3';

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
    let receiptUrl: string;
    let storage: 's3' | 'base64';
    if (isS3Configured()) {
      receiptUrl = await uploadReceipt(buffer, file.name, file.type);
      storage = 's3';
    } else {
      receiptUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
      storage = 'base64';
    }

    return NextResponse.json({
      message: 'Receipt uploaded successfully',
      url: receiptUrl,
      storage,
    });
  } catch (error: any) {
    console.error('Receipt upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload receipt' },
      { status: 500 }
    );
  }
}
