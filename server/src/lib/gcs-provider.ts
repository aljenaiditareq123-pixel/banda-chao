/**
 * Google Cloud Storage Provider (Legacy)
 * Wrapper for GCS service to implement StorageProvider interface
 * NOTE: This is kept for backward compatibility. Alibaba Cloud OSS is preferred for China market.
 */

import { uploadToGCS, deleteFromGCS, isGCSConfigured } from './gcs';
import { StorageProvider } from './storage';

export class GCSProvider implements StorageProvider {
  uploadFile(buffer: Buffer, fileName: string, folder: string = 'uploads'): Promise<string> {
    return uploadToGCS(buffer, fileName, folder);
  }

  deleteFile(fileUrl: string): Promise<void> {
    return deleteFromGCS(fileUrl);
  }

  isConfigured(): boolean {
    return isGCSConfigured();
  }

  getProviderName(): string {
    return 'Google Cloud Storage (GCS)';
  }
}
