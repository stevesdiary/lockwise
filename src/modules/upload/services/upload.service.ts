import { nanoid } from 'nanoid';
import { cloudStorage } from './unified-storage.service';

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
}

export const uploadService = {
  async uploadFile(file: Express.Multer.File, tenantId?: string, tenantName?: string) {
    let folderPath = '';
    if (tenantId && tenantName) {
      const sanitizedName = tenantName.replace(/[^a-zA-Z0-9-_]/g, '_');
      folderPath = `${tenantId}_${sanitizedName}/`;
    }

    const safeFilename = sanitizeFilename(file.originalname);
    const key = `${folderPath}${Date.now()}-${nanoid()}-${safeFilename}`;

    const url = await cloudStorage.uploadFile(key, file.buffer, file.mimetype);

    return {
      url,
      key,
      size: file.size,
      mimetype: file.mimetype,
      folder: folderPath || 'root',
    };
  },

  async getFilesByTenant(tenantId: string, tenantName: string) {
    const sanitizedName = tenantName.replace(/[^a-zA-Z0-9-_]/g, '_');
    return {
      files: [],
      folder: `${tenantId}_${sanitizedName}/`,
      count: 0,
    };
  },

  async getAllFiles() {
    return { files: [], count: 0 };
  },
};