import { Request, Response } from 'express';
import { webhookService } from '../services/webhook.service';

const webhookController = {
  handlePaystackWebhook: async (req: Request, res: Response) => {
    try {
      // Validate request body
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
      }

      // Verify signature
      const signature = req.headers['x-paystack-signature'] as string;
      if (!signature) {
        return res.status(400).json({ error: 'Missing signature' });
      }

      const isValid = webhookService.verifyPaystackSignature(req.body, signature);
      if (!isValid) {
        console.warn('Invalid webhook signature received');
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const { event, data } = req.body;

      // Validate required fields
      if (!event || !data) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Process webhook
      const result = await webhookService.processPaystackWebhook(event, data);
      
      return res.status(result.statusCode).json({ 
        received: result.success,
        message: result.message 
      });
    } catch (error) {
      console.error('Webhook processing error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body
      });
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  },

  handleFlutterwaveWebhook: async (req: Request, res: Response) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Invalid request body' });
      }

      const signature = req.headers['verif-hash'] as string;
      if (!signature) {
        return res.status(400).json({ error: 'Missing signature' });
      }

      const isValid = webhookService.verifyFlutterwaveSignature(req.body, signature);
      if (!isValid) {
        console.warn('Invalid webhook signature received');
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const { event, data } = req.body;

      if (!event || !data) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await webhookService.processFlutterwaveWebhook(event, data);
      
      return res.status(result.statusCode).json({ 
        received: result.success,
        message: result.message 
      });
    } catch (error) {
      console.error('Webhook processing error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        body: req.body
      });
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
};

export default webhookController;