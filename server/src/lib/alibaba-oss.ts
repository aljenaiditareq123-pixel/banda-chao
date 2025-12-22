/**
 * Alibaba Cloud OSS (Object Storage Service) Provider
 * Optimized for China market with fast CDN and reliable storage
 * 
 * Required Environment Variables:
 * - ALIBABA_ACCESS_KEY_ID: Your Alibaba Cloud Access Key ID
 * - ALIBABA_ACCESS_KEY_SECRET: Your Alibaba Cloud Access Key Secret
 * - ALIBABA_OSS_BUCKET: Your OSS bucket name
 * - ALIBABA_OSS_REGION: OSS region (e.g., 'oss-cn-shanghai', 'oss-cn-beijing')
 * - ALIBABA_OSS_ENDPOINT: Optional, auto-generated from region if not provided
 * 
 * Documentation: https://www.alibabacloud.com/help/en/oss
 */

import OSS from 'ali-oss';
import { randomUUID } from 'crypto';
import path from 'path';
import { StorageProvider } from './storage';

// Type definition for OSS client
type OSSClient = OSS;

let ossClient: OSSClient | null = null;
let bucketName: string | null = null;
let region: string | null = null;

/**
 * Initialize Alibaba Cloud OSS client
 */
function initializeOSS(): OSSClient {
  if (ossClient) {
    return ossClient;
  }

  const accessKeyId = process.env.ALIBABA_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIBABA_ACCESS_KEY_SECRET;
  bucketName = process.env.ALIBABA_OSS_BUCKET || null;
  region = process.env.ALIBABA_OSS_REGION || null;
  const endpoint = process.env.ALIBABA_OSS_ENDPOINT;

  if (!accessKeyId) {
    throw new Error('ALIBABA_ACCESS_KEY_ID environment variable is required');
  }

  if (!accessKeySecret) {
    throw new Error('ALIBABA_ACCESS_KEY_SECRET environment variable is required');
  }

  if (!bucketName) {
    throw new Error('ALIBABA_OSS_BUCKET environment variable is required');
  }

  if (!region && !endpoint) {
    throw new Error('ALIBABA_OSS_REGION or ALIBABA_OSS_ENDPOINT environment variable is required');
  }

  try {
    // Build OSS configuration
    // Note: ali-oss supports both region and endpoint, but not both together
    const ossConfig = {
      accessKeyId,
      accessKeySecret,
      bucket: bucketName!,
      ...(region ? { region } : endpoint ? { endpoint } : {}),
    };

    ossClient = new OSS(ossConfig);

    console.log('[Alibaba OSS] ✅ Alibaba Cloud OSS initialized successfully');
    console.log(`[Alibaba OSS] Region: ${region || endpoint}, Bucket: ${bucketName}`);
    return ossClient;
  } catch (error: any) {
    console.error('[Alibaba OSS] ❌ Failed to initialize OSS:', error.message);
    throw new Error(`Failed to initialize Alibaba Cloud OSS: ${error.message}`);
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
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
  };

  return contentTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Alibaba Cloud OSS Provider Implementation
 */
export class AlibabaOSSProvider implements StorageProvider {
  /**
   * Upload a file to Alibaba Cloud OSS
   */
  async uploadFile(buffer: Buffer, fileName: string, folder: string = 'uploads'): Promise<string> {
    try {
      const oss = initializeOSS();
      
      if (!bucketName) {
        throw new Error('OSS bucket name is not set');
      }

      // Generate unique file name
      const fileExtension = path.extname(fileName);
      const uniqueFileName = `${folder}/${randomUUID()}${fileExtension}`;

      // Upload file to OSS
      // ali-oss put method: put(objectName, file, options)
      const result = await oss.put(uniqueFileName, buffer, {
        mime: getContentType(fileExtension),
        headers: {
          'Cache-Control': 'public, max-age=31536000', // 1 year cache
        },
      });

      // Get public URL
      // OSS returns URL in format: https://{bucket}.{region}.aliyuncs.com/{object}
      const publicUrl = result.url;

      console.log(`[Alibaba OSS] ✅ File uploaded: ${publicUrl}`);
      return publicUrl;
    } catch (error: any) {
      console.error('[Alibaba OSS] ❌ Upload error:', error);
      throw new Error(`Failed to upload file to Alibaba Cloud OSS: ${error.message}`);
    }
  }

  /**
   * Delete a file from Alibaba Cloud OSS
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      const oss = initializeOSS();

      // Extract object key from URL
      // URL format: https://{bucket}.{region}.aliyuncs.com/{object}
      // or: https://{bucket}.oss-{region}.aliyuncs.com/{object}
      const urlPattern = /https?:\/\/[^\/]+\/(.+)$/;
      const match = fileUrl.match(urlPattern);
      
      if (!match || !match[1]) {
        throw new Error(`Invalid OSS URL format: ${fileUrl}`);
      }

      const objectKey = match[1];

      await oss.delete(objectKey);
      console.log(`[Alibaba OSS] ✅ File deleted: ${objectKey}`);
    } catch (error: any) {
      console.error('[Alibaba OSS] ❌ Delete error:', error);
      // Don't throw - deletion failure shouldn't break the flow
    }
  }

  /**
   * Check if Alibaba Cloud OSS is configured
   */
  isConfigured(): boolean {
    return !!(
      process.env.ALIBABA_ACCESS_KEY_ID &&
      process.env.ALIBABA_ACCESS_KEY_SECRET &&
      process.env.ALIBABA_OSS_BUCKET &&
      (process.env.ALIBABA_OSS_REGION || process.env.ALIBABA_OSS_ENDPOINT)
    );
  }

  /**
   * Get provider name
   */
  getProviderName(): string {
    return 'Alibaba Cloud OSS';
  }
}

/**
 * Legacy function exports for backward compatibility
 * @deprecated Use AlibabaOSSProvider class instead
 */
export async function uploadToAlibabaOSS(
  buffer: Buffer,
  fileName: string,
  folder: string = 'uploads'
): Promise<string> {
  const provider = new AlibabaOSSProvider();
  return provider.uploadFile(buffer, fileName, folder);
}

export function isAlibabaOSSConfigured(): boolean {
  const provider = new AlibabaOSSProvider();
  return provider.isConfigured();
}
