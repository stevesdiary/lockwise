import { Request, Response } from 'express';
import crypto from 'crypto';
import { paymentService } from '../../payment/services/payment.service';

export const webhookController = {
  async paystackWebhook(req: Request, res: Response) {
    try {
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (hash !== req.headers['x-paystack-signature']) {
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const event = req.body;

      switch (event.event) {
        case 'charge.success':
          await handleSuccessfulPayment(event.data);
          break;
        case 'charge.failed':
          await handleFailedPayment(event.data);
          break;
        case 'subscription.create':
          await handleSubscriptionCreated(event.data);
          break;
        case 'subscription.disable':
          await handleSubscriptionDisabled(event.data);
          break;
        default:
          console.log(`Unhandled Paystack event: ${event.event}`);
      }

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Paystack webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  },

  async flutterwaveWebhook(req: Request, res: Response) {
    try {
      const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
      const signature = req.headers['verif-hash'];

      if (!signature || signature !== secretHash) {
        return res.status(400).json({ error: 'Invalid signature' });
      }

      const payload = req.body;

      switch (payload.event) {
        case 'charge.completed':
          if (payload.data.status === 'successful') {
            await handleSuccessfulPayment(payload.data);
          } else {
            await handleFailedPayment(payload.data);
          }
          break;
        default:
          console.log(`Unhandled Flutterwave event: ${payload.event}`);
      }

      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Flutterwave webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }
};

// Helper functions
async function handleSuccessfulPayment(data: any) {
  try {
    const reference = data.reference || data.tx_ref;
    await paymentService.verifyPayment({ reference });
    
    // Send success notification
    console.log(`Payment successful: ${reference}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
}

async function handleFailedPayment(data: any) {
  try {
    const reference = data.reference || data.tx_ref;
    const reason = data.gateway_response || data.processor_response || 'Payment failed';
    
    await paymentService.handlePaymentFailure(reference, reason);
    
    // Send failure notification
    console.log(`Payment failed: ${reference} - ${reason}`);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
}

async function handleSubscriptionCreated(data: any) {
  try {
    console.log('Subscription created:', data);
    // Handle subscription creation logic
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

async function handleSubscriptionDisabled(data: any) {
  try {
    console.log('Subscription disabled:', data);
    // Handle subscription cancellation logic
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}