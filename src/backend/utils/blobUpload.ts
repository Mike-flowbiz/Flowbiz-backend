import { put } from '@vercel/blob';
import crypto from 'crypto';
import path from 'path';

function sanitizeName(fileName: string): string {
  return fileName.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
}

export function isBlobConfigured(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function saveBlobUpload(
  fileBuffer: Buffer,
  folder: string,
  fileName: string,
  contentType?: string
): Promise<string> {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const extension = path.extname(fileName);
  const baseName = sanitizeName(path.basename(fileName, extension));
  const uniqueName = `${baseName}-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;
  const key = `${cleanFolder}/${uniqueName}`;

  const { url } = await put(key, fileBuffer, {
    access: 'public',
    contentType,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  return url;
}
