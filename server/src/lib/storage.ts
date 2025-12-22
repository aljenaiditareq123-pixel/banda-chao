/**
 * Storage Abstraction Layer
 * Provides a unified interface for different cloud storage providers
 * Currently supports: Alibaba Cloud OSS, Google Cloud Storage (legacy)
 */

import { AlibabaOSSProvider } from './alibaba-oss';
import { GCSProvider } from './gcs-provider';

export interface StorageProvider {
  /**
   * Upload a file to cloud storage
   * @param buffer - File buffer to upload
   * @param fileName - Original file name
   * @param folder - Folder path in bucket (e.g., 'avatars', 'products', 'videos')
   * @returns Public URL of uploaded file
   */
  uploadFile(buffer: Buffer, fileName: string, folder?: string): Promise<string>;

  /**
   * Delete a file from cloud storage
   * @param fileUrl - Public URL of the file to delete
   */
  deleteFile(fileUrl: string): Promise<void>;

  /**
   * Check if the storage provider is configured
   * @returns true if configured, false otherwise
   */
  isConfigured(): boolean;

  /**
   * Get the provider name (for logging/debugging)
   */
  getProviderName(): string;
}

/**
 * Get the active storage provider based on environment configuration
 * Priority: Alibaba Cloud OSS > Google Cloud Storage
 * 
 * @returns StorageProvider instance
 */
export function getStorageProvider(): StorageProvider {
  // Priority 1: Alibaba Cloud OSS (for China market)
  const alibabaOSS = new AlibabaOSSProvider();
  if (alibabaOSS.isConfigured()) {
    console.log('[Storage] ✅ Using Alibaba Cloud OSS as storage provider');
    return alibabaOSS;
  }

  // Priority 2: Google Cloud Storage (legacy, fallback for non-China)
  const gcsProvider = new GCSProvider();
  if (gcsProvider.isConfigured()) {
    console.log('[Storage] ⚠️ Using Google Cloud Storage (legacy) as storage provider');
    console.log('[Storage] ⚠️ Note: GCS may have performance issues in China. Consider using Alibaba Cloud OSS.');
    return gcsProvider;
  }

  // No storage provider configured
  throw new Error(
    'No storage provider configured. Please configure either:\n' +
    '  - Alibaba Cloud OSS (recommended for China): ALIBABA_ACCESS_KEY_ID, ALIBABA_ACCESS_KEY_SECRET, ALIBABA_OSS_BUCKET, ALIBABA_OSS_REGION\n' +
    '  - Google Cloud Storage (legacy): GCS_SERVICE_ACCOUNT_KEY, GCLOUD_PROJECT_ID, GCS_BUCKET_NAME'
  );
}

/**
 * Check if any storage provider is configured
 * @returns true if at least one provider is configured
 */
export function isStorageConfigured(): boolean {
  try {
    const provider = getStorageProvider();
    return provider.isConfigured();
  } catch {
    return false;
  }
}
