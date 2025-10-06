import { S3Client } from '@aws-sdk/client-s3';

export const s3Client = new S3Client({
  endpoint: `https://${process.env.BUCKET_ENDPOINT}`,
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.KEY_ID!,
    secretAccessKey: process.env.BUCKET_API_KEY!,
  },
});

export const BUCKET_NAME = process.env.BUCKET_NAME!;