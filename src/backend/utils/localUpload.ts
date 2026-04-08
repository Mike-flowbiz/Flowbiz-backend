import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

function sanitizeName(fileName: string): string {
  return fileName.toLowerCase().replace(/[^a-z0-9._-]/g, '-');
}

export async function savePublicUpload(fileBuffer: Buffer, folder: string, fileName: string): Promise<string> {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const targetDir = path.join(process.cwd(), 'public', 'uploads', cleanFolder);
  await mkdir(targetDir, { recursive: true });

  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${sanitizeName(fileName)}`;
  const targetPath = path.join(targetDir, uniqueName);
  await writeFile(targetPath, fileBuffer);

  return `/uploads/${cleanFolder}/${uniqueName}`;
}
