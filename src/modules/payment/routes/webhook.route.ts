import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';

const router = Router();

// CSRF Protection: Webhook endpoints verify cryptographic signatures from payment providers
// (x-paystack-signature, verif-hash) to authenticate requests, not vulnerable to CSRF
router.post('/paystack', webhookController.paystackWebhook);

export default router;