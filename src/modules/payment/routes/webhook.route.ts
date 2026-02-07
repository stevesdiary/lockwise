import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

// Webhook endpoints (no auth required)
router.post('/paystack', webhookController.paystackWebhook);
router.post('/flutterwave', webhookController.flutterwaveWebhook);

export default router;