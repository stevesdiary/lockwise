import crypto from 'crypto';
import { Payment } from '../models/payment.model';
import { Subscription } from '../models/subscription.model';

interface WebhookResult {
  success: boolean;
  message: string;
  statusCode: number;
}

export const webhookService = {
  verifyPaystackSignature(body: any, signature: string): boolean {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY not configured');
    }

    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(body))
      .digest('hex');

    return hash === signature;
  },

  verifyFlutterwaveSignature(body: any, signature: string): boolean {
    if (!process.env.FLUTTERWAVE_SECRET_HASH) {
      throw new Error('FLUTTERWAVE_SECRET_HASH not configured');
    }

    const hash = crypto.createHash('sha256')
      .update(JSON.stringify(body) + process.env.FLUTTERWAVE_SECRET_HASH)
      .digest('hex');

    return hash === signature;
  },

  async processPaystackWebhook(event: string, data: any): Promise<WebhookResult> {
    try {
      if (event === 'charge.success') {
        if (!data.reference) {
          return {
            success: false,
            message: 'Missing payment reference',
            statusCode: 400
          };
        }

        const [updatedRows] = await Payment.update(
          { 
            payment_status: 'completed',
            payment_data: data
          },
          { where: { reference: data.reference }}
        );

        if (updatedRows === 0) {
          return {
            success: false,
            message: 'Payment not found',
            statusCode: 404
          };
        }

        const payment = await Payment.findOne({ where: { reference: data.reference }});
        if (payment) {
          await this.createOrExtendSubscription(payment);
        }

        return {
          success: true,
          message: 'Webhook processed successfully',
          statusCode: 200
        };
      }

      return {
        success: true,
        message: 'Event not handled',
        statusCode: 200
      };
    } catch (error) {
      throw new Error(`Webhook processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async processFlutterwaveWebhook(event: string, data: any): Promise<WebhookResult> {
    try {
      if (event === 'charge.completed' && data.status === 'successful') {
        const [updatedRows] = await Payment.update(
          { 
            payment_status: 'completed',
            payment_data: data
          },
          { where: { reference: data.tx_ref }}
        );

        if (updatedRows === 0) {
          return {
            success: false,
            message: 'Payment not found',
            statusCode: 404
          };
        }

        const payment = await Payment.findOne({ where: { reference: data.tx_ref }});
        if (payment) {
          await this.createOrExtendSubscription(payment);
        }

        return {
          success: true,
          message: 'Webhook processed successfully',
          statusCode: 200
        };
      }

      return {
        success: true,
        message: 'Event not handled',
        statusCode: 200
      };
    } catch (error) {
      throw new Error(`Webhook processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async createOrExtendSubscription(payment: any): Promise<void> {
    await Subscription.upsert({
      user_id: payment.user_id,
      estate_id: payment.estate_id,
      status: 'active',
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
  }
};