import { nanoid } from 'nanoid';
import { cloudStorage } from './cloud-storage.service';
import { FileUpload } from '../models/file-upload.model';

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\\.\\./g, '')
    .replace(/[\\/\\\\]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getUploadType(mimetype: string): 'image' | 'document' | 'general' {
  if (mimetype.startsWith('image/')) return 'image';
  if (['application/pdf', 'application/msword', 'text/csv', 'text/plain'].some(t => mimetype.includes(t))) return 'document';
  return 'general';
}

export const uploadService = {
  async uploadFile(file: Express.Multer.File, tenantId?: string, tenantName?: string, userId?: string) {
    let folderPath = '';
    if (tenantId && tenantName) {
      const sanitizedName = tenantName.replace(/[^a-zA-Z0-9-_]/g, '_');
      folderPath = `${tenantId}_${sanitizedName}/`;
    }

    const safeFilename = sanitizeFilename(file.originalname);
    const key = `${folderPath}${Date.now()}-${nanoid()}-${safeFilename}`;

    const url = await cloudStorage.uploadFile(key, file.buffer, file.mimetype);

    // Persist file record
    if (userId) {
      await FileUpload.create({
        user_id: userId,
        estate_id: tenantId || null,
        filename: safeFilename,
        original_name: file.originalname,
        file_key: key,
        file_url: url,
        file_size: file.size,
        mime_type: file.mimetype,
        upload_type: getUploadType(file.mimetype),
        folder: folderPath || 'general',
      });
    }

    return {
      url,
      key,
      size: file.size,
      mimetype: file.mimetype,
      folder: folderPath || 'root',
    };
  },

  async getFilesByTenant(tenantId: string, _tenantName: string) {
    const files = await FileUpload.findAll({
      where: { estate_id: tenantId },
      order: [['created_at', 'DESC']],
    });

    return {
      files: files.map(f => ({
        id: f.id,
        filename: f.original_name || f.filename,
        url: f.file_url,
        thumbnail_url: f.thumbnail_url,
        size: f.file_size,
        mime_type: f.mime_type,
        upload_type: f.upload_type,
        folder: f.folder,
        created_at: f.createdAt,
      })),
      folder: `${tenantId}/`,
      count: files.length,
    };
  },

  async getAllFiles() {
    const files = await FileUpload.findAll({
      order: [['created_at', 'DESC']],
      limit: 100,
    });

    return {
      files: files.map(f => ({
        id: f.id,
        filename: f.original_name || f.filename,
        url: f.file_url,
        size: f.file_size,
        mime_type: f.mime_type,
        upload_type: f.upload_type,
        created_at: f.createdAt,
      })),
      count: files.length,
    };
  },
};
