import { Request, Response } from 'express';
import crypto from 'crypto';
import { Payment } from './payment.model';
import { Subscription } from './subscription.model';

const webhookController = {
  handlePaystackWebhook: async (req: Request, res: Response) => {
    try {
      const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== req.headers['x-paystack-signature']) {
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const { event, data } = req.body;

      if (event === 'charge.success') {
        await Payment.update(
          { 
            payment_status: 'completed',
            payment_data: data
          },
          { where: { reference: data.reference }}
        );

        // Create or extend subscription
        const payment = await Payment.findOne({ where: { reference: data.reference }});
        if (payment) {
          await Subscription.upsert({
            user_id: payment.user_id,
            estate_id: payment.estate_id,
            status: 'active',
            start_date: new Date(),
            end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          });
        }
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
};

export default webhookController;