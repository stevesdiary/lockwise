import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  endpoint: process.env.BACKBLAZE_ENDPOINT || 'https://s3.us-west-004.backblazeb2.com',
  region: process.env.BACKBLAZE_REGION || 'us-west-004',
  credentials: {
    accessKeyId: process.env.BACKBLAZE_KEY_ID!,
    secretAccessKey: process.env.BACKBLAZE_APPLICATION_KEY!,
  },
});

export const BUCKET_NAME = process.env.BACKBLAZE_BUCKET_NAME!;