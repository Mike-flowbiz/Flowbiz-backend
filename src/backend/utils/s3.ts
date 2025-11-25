import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import path from 'path';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || '';

/**
 * Generate a unique filename with timestamp and random hash
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalName);
  const baseName = path.basename(originalName, extension);
  
  return `${baseName}-${timestamp}-${randomHash}${extension}`;
};

/**
 * Upload a file to S3
 */
export const uploadToS3 = async (
  file: Buffer,
  fileName: string,
  folder: string = 'uploads',
  contentType: string = 'application/octet-stream'
): Promise<string> => {
  const key = `${folder}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  try {
    await s3Client.send(command);
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Delete a file from S3
 */
export const deleteFromS3 = async (fileUrl: string): Promise<void> => {
  try {
    // Extract key from URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

/**
 * Generate a presigned URL for temporary file access
 */
export const getPresignedUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('S3 presigned URL error:', error);
    throw new Error('Failed to generate presigned URL');
  }
};

/**
 * Upload invoice PDF to S3
 */
export const uploadInvoicePDF = async (
  pdfBuffer: Buffer,
  invoiceNumber: string
): Promise<string> => {
  const fileName = `invoice-${invoiceNumber}.pdf`;
  return uploadToS3(pdfBuffer, fileName, 'invoices', 'application/pdf');
};

/**
 * Upload receipt image to S3
 */
export const uploadReceipt = async (
  fileBuffer: Buffer,
  originalName: string,
  contentType: string
): Promise<string> => {
  const fileName = generateUniqueFileName(originalName);
  return uploadToS3(fileBuffer, fileName, 'receipts', contentType);
};

/**
 * Upload company logo to S3
 */
export const uploadLogo = async (
  fileBuffer: Buffer,
  originalName: string,
  contentType: string
): Promise<string> => {
  const fileName = generateUniqueFileName(originalName);
  return uploadToS3(fileBuffer, fileName, 'logos', contentType);
};

// Check if S3 is configured
export const isS3Configured = (): boolean => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET &&
    process.env.AWS_REGION
  );
};

