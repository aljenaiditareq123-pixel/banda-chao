import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { getS3BucketName, getS3Client } from '@/utils/s3';

const DEFAULT_EXPIRATION_SECONDS = 300; // 5 minutes
const DEFAULT_UPLOAD_PREFIX = 'videos/';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { fileName, contentType } = body as Partial<{
      fileName: string;
      contentType: string;
    }>;

    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName is required to generate the upload URL.' },
        { status: 400 },
      );
    }

    const bucket = getS3BucketName();
    const client = getS3Client();

    const safeFileName = fileName.replace(/\s+/g, '-');
    const objectKey = `${DEFAULT_UPLOAD_PREFIX}${Date.now()}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      ContentType: contentType ?? 'application/octet-stream',
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: DEFAULT_EXPIRATION_SECONDS,
    });

    return NextResponse.json({
      uploadUrl,
      key: objectKey,
      bucket,
      expiresIn: DEFAULT_EXPIRATION_SECONDS,
    });
  } catch (error) {
    console.error('Failed to generate S3 upload URL', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL. Please try again later.' },
      { status: 500 },
    );
  }
}

export const GET = () =>
  NextResponse.json(
    { error: 'Method not allowed. Use POST to generate an upload URL.' },
    { status: 405 },
  );

export const PUT = GET;
export const PATCH = GET;
export const DELETE = GET;
