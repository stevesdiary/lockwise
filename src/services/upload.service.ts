import { PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME } from '../core/object.storage';
import { nanoid } from 'nanoid';

export const uploadService = {
  async uploadFile(file: Express.Multer.File, tenantId?: string, tenantName?: string) {
    try {
      let folderPath = '';
      if (tenantId && tenantName) {
        const sanitizedName = tenantName.replace(/[^a-zA-Z0-9-_]/g, '_');
        folderPath = `${tenantId}_${sanitizedName}/`;
      }
      
      const key = `${folderPath}${Date.now()}-${nanoid()}-${file.originalname}`;
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await s3Client.send(command);
      
      return {
        url: `https://${process.env.BUCKET_ENDPOINT}/${BUCKET_NAME}/${key}`,
        key,
        size: file.size,
        mimetype: file.mimetype,
        folder: folderPath || 'root'
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  },

  async getFilesByTenant(tenantId: string, tenantName: string) {
    try {
      const sanitizedName = tenantName.replace(/[^a-zA-Z0-9-_]/g, '_');
      const folderPath = `${tenantId}_${sanitizedName}/`;
      
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: folderPath,
      });

      const response = await s3Client.send(command);
      
      return {
        files: response.Contents?.map(obj => ({
          key: obj.Key,
          url: `https://${process.env.BUCKET_ENDPOINT}/${BUCKET_NAME}/${obj.Key}`,
          size: obj.Size,
          lastModified: obj.LastModified,
          filename: obj.Key?.split('/').pop()
        })) || [],
        folder: folderPath,
        count: response.KeyCount || 0
      };
    } catch (error) {
      console.error('S3 list error:', error);
      throw error;
    }
  },

  async getAllFiles() {
    try {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
      });

      const response = await s3Client.send(command);
      
      return {
        files: response.Contents?.map(obj => ({
          key: obj.Key,
          url: `https://${process.env.BUCKET_ENDPOINT}/${BUCKET_NAME}/${obj.Key}`,
          size: obj.Size,
          lastModified: obj.LastModified,
          filename: obj.Key?.split('/').pop(),
          folder: obj.Key?.includes('/') ? obj.Key.split('/')[0] : 'root'
        })) || [],
        count: response.KeyCount || 0
      };
    } catch (error) {
      console.error('S3 list all error:', error);
      throw error;
    }
  }
};