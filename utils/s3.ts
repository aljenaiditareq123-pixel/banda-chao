'use server';

import { S3Client } from '@aws-sdk/client-s3';

let cachedClient: S3Client | null = null;
let cachedBucketName: string | null = null;

type S3EnvKey =
  | 'S3_ACCESS_KEY_ID'
  | 'S3_SECRET_ACCESS_KEY'
  | 'S3_REGION'
  | 'S3_BUCKET_NAME';

const getEnvVar = (key: S3EnvKey): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}. Please configure your S3 credentials (see example.env).`,
    );
  }
  return value;
};

export const getS3Client = (): S3Client => {
  if (cachedClient) {
    return cachedClient;
  }

  const region = getEnvVar('S3_REGION');
  const accessKeyId = getEnvVar('S3_ACCESS_KEY_ID');
  const secretAccessKey = getEnvVar('S3_SECRET_ACCESS_KEY');

  cachedClient = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return cachedClient;
};

export const getS3BucketName = (): string => {
  if (!cachedBucketName) {
    cachedBucketName = getEnvVar('S3_BUCKET_NAME');
  }

  return cachedBucketName;
};

export const resetS3Cache = () => {
  cachedClient = null;
  cachedBucketName = null;
};
