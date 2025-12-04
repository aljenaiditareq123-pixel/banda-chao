/**
 * Google Cloud Storage (GCS) Service
 * Handles file uploads to GCS bucket
 */

import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';
import path from 'path';

// Initialize GCS client
let storage: Storage | null = null;
let bucketName: string | null = null;

/**
 * Initialize GCS Storage client
 */
function initializeGCS(): Storage {
  if (storage) {
    return storage;
  }

  const gcsKeyJson = process.env.GCS_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.GCLOUD_PROJECT_ID;
  bucketName = process.env.GCS_BUCKET_NAME || 'banda-chao-uploads';

  if (!gcsKeyJson) {
    throw new Error('GCS_SERVICE_ACCOUNT_KEY environment variable is required');
  }

  if (!projectId) {
    throw new Error('GCLOUD_PROJECT_ID environment variable is required');
  }

  try {
    // Parse the JSON key from environment variable
    const keyData = JSON.parse(gcsKeyJson);
    
    storage = new Storage({
      projectId,
      credentials: keyData,
    });

    console.log('[GCS] ✅ Google Cloud Storage initialized successfully');
    return storage;
  } catch (error: any) {
    console.error('[GCS] ❌ Failed to initialize GCS:', error.message);
    throw new Error(`Failed to initialize GCS: ${error.message}`);
  }
}

/**
 * Upload file to GCS bucket
 * @param fileBuffer - File buffer to upload
 * @param fileName - Original file name
 * @param folder - Folder path in bucket (e.g., 'avatars', 'products', 'videos')
 * @returns Public URL of uploaded file
 */
export async function uploadToGCS(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = 'uploads'
): Promise<string> {
  try {
    const gcs = initializeGCS();
    
    if (!bucketName) {
      throw new Error('GCS_BUCKET_NAME is not set');
    }

    // Generate unique file name
    const fileExtension = path.extname(fileName);
    const uniqueFileName = `${folder}/${randomUUID()}${fileExtension}`;

    // Get bucket
    const bucket = gcs.bucket(bucketName);

    // Create file reference
    const file = bucket.file(uniqueFileName);

    // Upload file
    await file.save(fileBuffer, {
      metadata: {
        contentType: getContentType(fileExtension),
        cacheControl: 'public, max-age=31536000', // 1 year cache
      },
      public: true, // Make file publicly accessible
    });

    // Get public URL
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFileName}`;

    console.log(`[GCS] ✅ File uploaded: ${publicUrl}`);
    return publicUrl;
  } catch (error: any) {
    console.error('[GCS] ❌ Upload error:', error);
    throw new Error(`Failed to upload file to GCS: ${error.message}`);
  }
}

/**
 * Delete file from GCS bucket
 * @param fileUrl - Public URL of the file to delete
 */
export async function deleteFromGCS(fileUrl: string): Promise<void> {
  try {
    const gcs = initializeGCS();
    
    if (!bucketName) {
      throw new Error('GCS_BUCKET_NAME is not set');
    }

    // Extract file path from URL
    const urlParts = fileUrl.split('/');
    const filePath = urlParts.slice(3).join('/'); // Remove https://storage.googleapis.com/bucket-name/

    const bucket = gcs.bucket(bucketName);
    const file = bucket.file(filePath);

    await file.delete();
    console.log(`[GCS] ✅ File deleted: ${filePath}`);
  } catch (error: any) {
    console.error('[GCS] ❌ Delete error:', error);
    // Don't throw - deletion failure shouldn't break the flow
  }
}

/**
 * Get content type based on file extension
 */
function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
  };

  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Check if GCS is configured
 */
export function isGCSConfigured(): boolean {
  return !!(
    process.env.GCS_SERVICE_ACCOUNT_KEY &&
    process.env.GCLOUD_PROJECT_ID &&
    process.env.GCS_BUCKET_NAME
  );
}

