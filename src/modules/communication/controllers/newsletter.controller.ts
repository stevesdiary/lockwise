import { Request, Response } from 'express';
import newsletterService from '../services/newsletter.service';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';

class NewsletterController {
  async subscribe(req: Request, res: Response) {
    try {
      const { email, first_name } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }

      const { subscriber, isNew } = await newsletterService.subscribe(email, first_name, 'landing_page');

      if (isNew) {
        newsletterService.sendWelcomeEmail(subscriber.email, subscriber.first_name || '').catch(() => {});
      }

      return res.status(201).json({
        success: true,
        message: isNew ? 'Subscribed successfully' : 'Already subscribed',
        data: { id: subscriber.id, email: subscriber.email, status: subscriber.status },
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async unsubscribe(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const updated = await newsletterService.unsubscribe(email);
      return res.status(200).json({
        success: true,
        message: updated ? 'Unsubscribed successfully' : 'Email not found or already unsubscribed',
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getSubscribers(req: Request, res: Response) {
    try {
      const { status, page, limit } = req.query as any;
      const result = await newsletterService.getSubscribers({
        status,
        page: page ? parseInt(page, 10) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
      });
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const stats = await newsletterService.getStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new NewsletterController();
