import { Response } from 'express';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { maintenanceService } from '../services/maintenance.service';
import { asString } from '../../../shared/utils/param.util';
import fileUploadService from '../../upload/services/file-upload.service';
import { MaintenanceStatus } from '../types/maintenance.types';

export const maintenanceController = {
  async submitRequest(req: AuthRequest, res: Response) {
    try {
      const { title, description, category, priority, photo_urls, unit_id } = req.body;
      const estateId = req.user!.estate_id;

      if (!estateId) {
        return res.status(400).json({ success: false, message: 'You must be associated with an estate' });
      }

      const request = await maintenanceService.submitRequest(req.user!.id, estateId, {
        title,
        description,
        category,
        priority,
        photo_urls,
        unit_id,
      });

      res.status(201).json({ success: true, data: request });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to submit request' });
    }
  },

  async listRequests(req: AuthRequest, res: Response) {
    try {
      const estateId = req.user!.estate_id;
      const role = (req.user!.role as string)?.toLowerCase();
      const status = req.query.status as MaintenanceStatus | undefined;

      const requests = await maintenanceService.listRequests(
        req.user!.id,
        estateId || '',
        role,
        status
      );

      res.json({ success: true, data: requests });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch requests' });
    }
  },

  async getRequest(req: AuthRequest, res: Response) {
    try {
      const requestId = asString(req.params.id);
      const role = (req.user!.role as string)?.toLowerCase();

      const request = await maintenanceService.getRequestWithComments(
        requestId,
        req.user!.id,
        role
      );

      res.json({ success: true, data: request });
    } catch (error: any) {
      if (error.message === 'Request not found') {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      if (error.message === 'Forbidden') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch request' });
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const requestId = asString(req.params.id);
      const { status } = req.body;

      const request = await maintenanceService.updateStatus(requestId, status, req.user!.id);
      res.json({ success: true, data: request });
    } catch (error: any) {
      if (error.message === 'Request not found') {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      res.status(500).json({ success: false, message: error.message || 'Failed to update status' });
    }
  },

  async addComment(req: AuthRequest, res: Response) {
    try {
      const requestId = asString(req.params.id);
      const { message } = req.body;

      const comment = await maintenanceService.addComment(requestId, req.user!.id, message);
      res.status(201).json({ success: true, data: comment });
    } catch (error: any) {
      if (error.message === 'Request not found') {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      res.status(500).json({ success: false, message: error.message || 'Failed to add comment' });
    }
  },

  async uploadPhotos(req: AuthRequest, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files provided' });
      }

      const results = await fileUploadService.uploadMultipleFiles(files, 'maintenance');
      const photo_urls = results
        .filter((r) => r.success && r.url)
        .map((r) => r.url!);

      res.json({ success: true, data: { photo_urls } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to upload photos' });
    }
  },

  async deleteRequest(req: AuthRequest, res: Response) {
    try {
      const requestId = asString(req.params.id);
      await maintenanceService.deleteRequest(requestId);
      res.json({ success: true, message: 'Request deleted' });
    } catch (error: any) {
      if (error.message === 'Request not found') {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      res.status(500).json({ success: false, message: error.message || 'Failed to delete request' });
    }
  },
};
