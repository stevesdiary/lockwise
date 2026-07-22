import { Response } from 'express';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { maintenanceService } from '../services/maintenance.service';
import { asString } from '../../../shared/utils/param.util';
import fileUploadService from '../../upload/services/file-upload.service';
import { MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '../types/maintenance.types';

const VALID_CATEGORIES: MaintenanceCategory[] = ['plumbing', 'electrical', 'structural', 'common_area', 'security', 'other'];
const VALID_PRIORITIES: MaintenancePriority[] = ['low', 'medium', 'high', 'urgent'];
const VALID_STATUSES: MaintenanceStatus[] = ['open', 'in_progress', 'resolved', 'closed'];

export const maintenanceController = {
  async submitRequest(req: AuthRequest, res: Response) {
    try {
      const { title, description, category, priority, photo_urls, unit_id } = req.body;
      const estateId = req.user!.estate_id;

      if (!estateId) {
        return res.status(400).json({ success: false, message: 'You must be associated with an estate' });
      }

      if (!title || typeof title !== 'string' || title.trim().length < 3 || title.length > 200) {
        return res.status(400).json({ success: false, message: 'Title must be 3-200 characters' });
      }

      if (!description || typeof description !== 'string' || description.trim().length < 10 || description.length > 2000) {
        return res.status(400).json({ success: false, message: 'Description must be 10-2000 characters' });
      }

      if (!VALID_CATEGORIES.includes(category)) {
        return res.status(400).json({ success: false, message: 'Invalid category' });
      }

      if (priority && !VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ success: false, message: 'Invalid priority' });
      }

      if (photo_urls && (!Array.isArray(photo_urls) || photo_urls.length > 3 || photo_urls.some((u: any) => typeof u !== 'string'))) {
        return res.status(400).json({ success: false, message: 'photo_urls must be an array of up to 3 strings' });
      }

      if (unit_id && typeof unit_id !== 'string') {
        return res.status(400).json({ success: false, message: 'Invalid unit_id' });
      }

      const request = await maintenanceService.submitRequest(req.user!.id, estateId, {
        title: title.trim(),
        description: description.trim(),
        category,
        priority,
        photo_urls,
        unit_id,
      });

      res.status(201).json({ success: true, data: request });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to submit request' });
    }
  },

  async listRequests(req: AuthRequest, res: Response) {
    try {
      const estateId = req.user!.estate_id;
      const role = (req.user!.role as string)?.toLowerCase();
      const status = req.query.status as MaintenanceStatus | undefined;

      if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status filter' });
      }

      const limit = req.query.limit ? Number(req.query.limit) : undefined;
      const offset = req.query.offset ? Number(req.query.offset) : undefined;

      const result = await maintenanceService.listRequests(
        req.user!.id,
        estateId || '',
        role,
        status,
        limit,
        offset
      );

      res.json({ success: true, data: result.requests, total: result.total, limit: result.limit, offset: result.offset });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to fetch requests' });
    }
  },

  async getRequest(req: AuthRequest, res: Response) {
    try {
      const requestId = asString(req.params.id);
      const role = (req.user!.role as string)?.toLowerCase();
      const estateId = req.user!.estate_id;

      const request = await maintenanceService.getRequestWithComments(
        requestId,
        req.user!.id,
        role,
        estateId
      );

      res.json({ success: true, data: request });
    } catch (error: any) {
      if (error.message === 'Request not found') {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      if (error.message === 'Forbidden') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      res.status(500).json({ success: false, message: 'Failed to fetch request' });
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const requestId = asString(req.params.id);
      const { status } = req.body;
      const estateId = req.user!.estate_id;

      if (!status || !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      if (!estateId) {
        return res.status(400).json({ success: false, message: 'Estate required' });
      }

      const request = await maintenanceService.updateStatus(requestId, status, req.user!.id, estateId);
      res.json({ success: true, data: request });
    } catch (error: any) {
      if (error.message === 'Request not found') {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      if (error.message === 'Invalid status') {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }
      res.status(500).json({ success: false, message: 'Failed to update status' });
    }
  },

  async addComment(req: AuthRequest, res: Response) {
    try {
      const requestId = asString(req.params.id);
      const { message } = req.body;
      const role = (req.user!.role as string)?.toLowerCase();
      const estateId = req.user!.estate_id;

      if (!message || typeof message !== 'string' || message.trim().length < 1 || message.length > 2000) {
        return res.status(400).json({ success: false, message: 'Comment must be 1-2000 characters' });
      }

      const comment = await maintenanceService.addComment(requestId, req.user!.id, message.trim(), role, estateId);
      res.status(201).json({ success: true, data: comment });
    } catch (error: any) {
      if (error.message === 'Request not found') {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      if (error.message === 'Forbidden') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }
      res.status(500).json({ success: false, message: 'Failed to add comment' });
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
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to upload photos' });
    }
  },

  async deleteRequest(req: AuthRequest, res: Response) {
    try {
      const requestId = asString(req.params.id);
      const estateId = req.user!.estate_id;

      if (!estateId) {
        return res.status(400).json({ success: false, message: 'Estate required' });
      }

      await maintenanceService.deleteRequest(requestId, estateId);
      res.json({ success: true, message: 'Request deleted' });
    } catch (error: any) {
      if (error.message === 'Request not found') {
        return res.status(404).json({ success: false, message: 'Request not found' });
      }
      res.status(500).json({ success: false, message: 'Failed to delete request' });
    }
  },
};
