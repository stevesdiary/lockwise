import { Request, Response } from 'express';
import demoRequestService from '../services/demo-request.service';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';

class DemoRequestController {
  async createRequest(req: Request, res: Response) {
    try {
      const { name, email, phone, company, estate_size, message } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Name is required' });
      }
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }

      const validSizes = ['1-50', '51-200', '201-500', '500+', null, undefined];
      if (estate_size && !validSizes.includes(estate_size)) {
        return res.status(400).json({ success: false, message: 'Invalid estate_size value' });
      }

      const request = await demoRequestService.createRequest({
        name: name.trim(),
        email: email.trim(),
        phone,
        company,
        estate_size,
        message,
      });

      return res.status(201).json({
        success: true,
        message: 'Demo request submitted successfully. We will reach out to you shortly.',
        data: { id: request.id, status: request.status },
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getRequests(req: Request, res: Response) {
    try {
      const { status, page, limit } = req.query as any;
      const result = await demoRequestService.getRequests({
        status,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getRequest(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const request = await demoRequestService.getRequest(id);
      if (!request) {
        return res.status(404).json({ success: false, message: 'Demo request not found' });
      }
      return res.status(200).json({ success: true, data: request });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async updateRequest(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status, notes } = req.body;

      const validStatuses = ['pending', 'contacted', 'scheduled', 'completed', 'cancelled'];
      if (status && !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status value' });
      }

      const updated = await demoRequestService.updateStatus(id, status, notes);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Demo request not found' });
      }
      return res.status(200).json({ success: true, message: 'Demo request updated' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await demoRequestService.getStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new DemoRequestController();
