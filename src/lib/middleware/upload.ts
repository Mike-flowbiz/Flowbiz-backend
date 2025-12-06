/**
 * File upload utilities for Next.js API routes
 */

export interface UploadedFile {
  name: string;
  type: string;
  buffer: Buffer;
  size: number;
}

/**
 * Parse FormData and extract file
 */
export async function parseFormData(
  request: Request
): Promise<{ file: File | null; fields: Record<string, string> }> {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const fields: Record<string, string> = {};

  // Extract other form fields
  for (const [key, value] of formData.entries()) {
    if (key !== 'file' && key !== 'logo' && key !== 'receipt' && key !== 'pdf') {
      fields[key] = value.toString();
    }
  }

  return { file: file || null, fields };
}

/**
 * Parse FormData and extract file by field name
 */
export async function parseFileField(
  request: Request,
  fieldName: string = 'file'
): Promise<{ file: File | null; fields: Record<string, string> }> {
  const formData = await request.formData();
  const file = formData.get(fieldName) as File | null;
  const fields: Record<string, string> = {};

  // Extract other form fields
  for (const [key, value] of formData.entries()) {
    if (key !== fieldName) {
      fields[key] = value.toString();
    }
  }

  return { file: file || null, fields };
}


/**
 * Validate file type
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only image files (JPEG, PNG, GIF, WebP) are allowed',
    };
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 5MB',
    };
  }

  return { valid: true };
}

/**
 * Validate receipt file (images and PDFs)
 */
export function validateReceiptFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only image files or PDFs are allowed for receipts',
    };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB',
    };
  }

  return { valid: true };
}

/**
 * Validate PDF file
 */
export function validatePDFFile(file: File): { valid: boolean; error?: string } {
  if (file.type !== 'application/pdf') {
    return {
      valid: false,
      error: 'Only PDF files are allowed',
    };
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB',
    };
  }

  return { valid: true };
}

/**
 * Convert File to Buffer
 */
export async function fileToBuffer(file: File): Promise<Buffer> {
  const arrayBuffer = await file.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
