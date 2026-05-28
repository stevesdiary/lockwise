import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

// Allowed MIME types and extensions
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.xls', '.xlsx', '.csv'];

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

// Magic numbers for file type verification
const MAGIC_NUMBERS: Record<string, string[]> = {
  'image/jpeg': ['ffd8ff'],
  'image/png': ['89504e47'],
  'image/gif': ['474946'],
  'image/webp': ['52494646'],
  'application/pdf': ['25504446'],
};

// Sanitize filename to prevent path traversal
export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Remove consecutive dots
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 255); // Limit length
};

// Verify file type by checking magic numbers
export const verifyFileType = async (filePath: string, expectedMime: string): Promise<boolean> => {
  try {
    const buffer = Buffer.alloc(8);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 8, 0);
    fs.closeSync(fd);
    
    const hex = buffer.toString('hex').toLowerCase();
    const magicNumbers = MAGIC_NUMBERS[expectedMime];
    
    if (!magicNumbers) return true; // Skip verification if no magic number defined
    
    return magicNumbers.some(magic => hex.startsWith(magic));
  } catch {
    return false;
  }
};

// File filter for multer
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();
  
  // Check extension
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error(`File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`));
  }
  
  // Check MIME type
  const allowedMimes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOCUMENT_TYPES];
  if (!allowedMimes.includes(mime)) {
    return cb(new Error('Invalid file MIME type'));
  }
  
  // Check size based on type
  const maxSize = ALLOWED_IMAGE_TYPES.includes(mime) ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
  if (file.size && file.size > maxSize) {
    return cb(new Error(`File too large. Max size: ${maxSize / (1024 * 1024)}MB`));
  }
  
  cb(null, true);
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || '/tmp/uploads';
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitized = sanitizeFilename(path.basename(file.originalname, ext));
    const filename = `${uniqueId}-${sanitized}${ext}`;
    
    cb(null, filename);
  },
});

// Multer upload middleware
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE, // Max file size
    files: 5, // Max number of files
    fields: 10, // Max number of non-file fields
    fieldSize: 1024 * 1024, // Max field value size (1MB)
  },
});

// Middleware to verify file after upload
export const verifyUploadedFile = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) return next();
  
  try {
    const isValid = await verifyFileType(req.file.path, req.file.mimetype);
    
    if (!isValid) {
      // Delete invalid file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'File content does not match declared type' });
    }
    
    next();
  } catch (error) {
    // Clean up on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    return res.status(500).json({ error: 'File verification failed' });
  }
};

// Cleanup middleware to delete files on error
export const cleanupOnError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (req.file?.path && fs.existsSync(req.file.path)) {
    fs.unlinkSync(req.file.path);
  }
  
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
  }
  
  next(err);
};
