import multer from 'multer';
import { Request } from 'express';
import { cloudStorage } from './unified-storage.service';
import imageProcessingService from './image-processing.service';
import fileValidationService from './file-validation.service';
import { nanoid } from 'nanoid';

interface UploadResult {
  success: boolean;
  url?: string;
  thumbnailUrl?: string;
  key?: string;
  error?: string;
}

class FileUploadService {
  
  private storage = multer.memoryStorage();
  
  public uploader = multer({
    storage: this.storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max
      files: 5 // Max 5 files per request
    },
    fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      // Basic MIME type check (detailed validation happens later)
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain', 'text/csv'
      ];
      
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('File type not allowed'));
      }
    }
  });

  async uploadFile(file: Express.Multer.File, folder: string = 'general'): Promise<UploadResult> {
    try {
      // Validate file
      const validation = await fileValidationService.validateFile(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Generate unique key
      const fileId = nanoid();
      const extension = validation.extension || 'bin';
      const key = `${folder}/${fileId}.${extension}`;

      let processedBuffer = file.buffer;
      let thumbnailUrl: string | undefined;

      // Process images
      if (fileValidationService.isImageFile(file.mimetype)) {
        // Optimize main image
        processedBuffer = await imageProcessingService.optimizeForWeb(file.buffer);
        
        // Create thumbnail
        const thumbnailBuffer = await imageProcessingService.createThumbnail(file.buffer);
        const thumbnailKey = `${folder}/thumbnails/${fileId}.jpg`;
        
        try {
          thumbnailUrl = await cloudStorage.uploadFile(thumbnailKey, thumbnailBuffer, 'image/jpeg');
        } catch (error) {
          console.warn('Thumbnail upload failed:', error);
        }
      }

      // Upload main file
      const url = await cloudStorage.uploadFile(key, processedBuffer, file.mimetype);

      return {
        success: true,
        url,
        thumbnailUrl,
        key
      };

    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder: string = 'general'): Promise<UploadResult[]> {
    const results = await Promise.allSettled(
      files.map(file => this.uploadFile(file, folder))
    );

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : { success: false, error: 'Upload failed' }
    );
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      await cloudStorage.deleteFile(key);
      
      // Try to delete thumbnail if it exists
      if (key.includes('/')) {
        const [folder, filename] = key.split('/');
        const thumbnailKey = `${folder}/thumbnails/${filename.replace(/\.[^/.]+$/, '.jpg')}`;
        try {
          await cloudStorage.deleteFile(thumbnailKey);
        } catch (error) {
          // Thumbnail deletion failure is not critical
        }
      }
      
      return true;
    } catch (error) {
      console.error('File deletion failed:', error);
      return false;
    }
  }

  getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    return cloudStorage.getSignedUrl(key, expiresIn);
  }
}

export default new FileUploadService();