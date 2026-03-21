import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface StorageConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  endpoint?: string;
  bucket: string;
}

class CloudStorageService {
  private s3Client: S3Client;
  private bucket: string;

  constructor(config: StorageConfig) {
    this.s3Client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpoint && { endpoint: config.endpoint }),
      forcePathStyle: !!config.endpoint // Required for Backblaze B2
    });
    this.bucket = config.bucket;
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.s3Client.send(command);
    
    // Return public URL
    const baseUrl = process.env.STORAGE_ENDPOINT || `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com`;
    return `${baseUrl}/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    await this.s3Client.send(command);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    return await getSignedUrl(this.s3Client, command, { expiresIn });
  }
}

// Initialize storage service
const storageConfig: StorageConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.B2_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.B2_SECRET_ACCESS_KEY || '',
  region: process.env.AWS_REGION || 'us-east-1',
  endpoint: process.env.STORAGE_ENDPOINT, // For Backblaze B2
  bucket: process.env.STORAGE_BUCKET || 'lockwise-uploads'
};

export const cloudStorage = new CloudStorageService(storageConfig);
export default CloudStorageService;