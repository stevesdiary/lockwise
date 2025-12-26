import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { b2Storage } from './backblaze-b2.service';

interface StorageConfig {
  provider: 'aws' | 'b2';
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  endpoint?: string;
  bucket: string;
}

class UnifiedStorageService {
  private provider: 'aws' | 'b2';
  private s3Client?: S3Client;
  private bucket: string;

  constructor(config: StorageConfig) {
    this.provider = config.provider;
    this.bucket = config.bucket;

    if (config.provider === 'aws') {
      this.s3Client = new S3Client({
        region: config.region || 'us-east-1',
        credentials: {
          accessKeyId: config.accessKeyId!,
          secretAccessKey: config.secretAccessKey!,
        },
        ...(config.endpoint && { endpoint: config.endpoint })
      });
    }
  }

  async uploadFile(key: string, buffer: Buffer, contentType: string): Promise<string> {
    if (this.provider === 'b2') {
      return await b2Storage.uploadFile(key, buffer, contentType);
    }

    // AWS S3
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ACL: 'public-read'
    });

    await this.s3Client!.send(command);
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    if (this.provider === 'b2') {
      return await b2Storage.deleteFile(key);
    }

    // AWS S3
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key
    });

    await this.s3Client!.send(command);
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    if (this.provider === 'b2') {
      return await b2Storage.getDownloadAuthorization(key, expiresIn);
    }

    // For AWS S3, would need @aws-sdk/s3-request-presigner
    // Fallback to public URL for now
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }
}

// Initialize storage service based on environment
const storageConfig: StorageConfig = {
  provider: process.env.STORAGE_PROVIDER as 'aws' | 'b2' || 'b2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  endpoint: process.env.STORAGE_ENDPOINT,
  bucket: process.env.STORAGE_BUCKET || 'lockwise-uploads'
};

export const cloudStorage = new UnifiedStorageService(storageConfig);
export default UnifiedStorageService;