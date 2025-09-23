import { Router, Request, Response } from 'express';
import webhookController from './webhook.controller';

const webhookRouter = Router();

webhookRouter.post('/paystack', async (req: Request, res: Response) => {
  await webhookController.handlePaystackWebhook(req, res);
});

export default webhookRouter;