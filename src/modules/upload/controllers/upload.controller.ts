import { Request, Response } from 'express';
import { uploadService } from '../services/upload.service';
import { Estate } from '../../estate/models/estate.model';

export const uploadController = {
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const tenantId = req.user?.estate_id || req.body.tenant_id;
      let tenantName = '';
      
      if (tenantId) {
        const estate = await Estate.findByPk(tenantId);
        tenantName = estate?.name || '';
      }

      const result = await uploadService.uploadFile(req.file, tenantId, tenantName);
      res.json({
        success: true,
        data: {
          file_url: result.url,
          file_name: req.file.originalname,
          file_type: req.file.mimetype,
          file_size: result.size,
        },
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        error: 'Upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  async getFiles(req: Request, res: Response) {
    try {
      const tenantId = req.query.tenant_id as string || req.user?.estate_id;
      
      if (tenantId) {
        const estate = await Estate.findByPk(tenantId);
        if (!estate) {
          return res.status(404).json({ error: 'Estate not found' });
        }
        
        const result = await uploadService.getFilesByTenant(tenantId, estate.name);
        res.json(result);
      } else {
        const result = await uploadService.getAllFiles();
        res.json(result);
      }
    } catch (error) {
      console.error('Get files error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch files',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};