import { Request, Response } from 'express';
import { uploadService } from '../services/upload.service';

export const uploadController = {
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const result = await uploadService.uploadFile(req.file);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Upload failed' });
    }
  }
};