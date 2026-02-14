import { PutObjectCommand, ListObjectsV2Command, _Object } from '@aws-sdk/client-s3';
import objectStorage from '../../../shared/core/object.storage';
import { nanoid } from 'nanoid';
import path from 'path';

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'lockwise-uploads';

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename: string): string {
  // Remove path separators and parent directory references
  return filename
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
}

export const uploadService = {
  async uploadFile(file: Express.Multer.File, tenantId?: string, tenantName?: string) {
    try {
      let folderPath = '';
      if (tenantId && tenantName) {
        const sanitizedName = tenantName.replace(/[^a-zA-Z0-9-_]/g, '_');
        folderPath = `${tenantId}_${sanitizedName}/`;
      }
      
      // Sanitize filename to prevent path traversal attacks
      const safeFilename = sanitizeFilename(file.originalname);
      const key = `${folderPath}${Date.now()}-${nanoid()}-${safeFilename}`;
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await objectStorage.upload(file);
      
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
      
      return {
        files: [],
        folder: folderPath,
        count: 0
      };
    } catch (error) {
      console.error('S3 list error:', error);
      throw error;
    }
  },

  async getAllFiles() {
    try {
      return {
        files: [],
        count: 0
      };
    } catch (error) {
      console.error('S3 list all error:', error);
      throw error;
    }
  }
};