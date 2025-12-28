import { nanoid } from 'nanoid';
import { Payment } from '../models/payment.model';
import { Subscription } from '../models/subscription.model';
import { Plan } from '../models/plan.model';
import PaystackService from './paystack.service';
import FlutterwaveService from './flutterwave.service';

interface PaymentData {
  amount: number;
  email: string;
  currency?: string;
  payment_provider?: 'paystack' | 'flutterwave';
  payment_method: string;
  user_id?: string;
  plan_id?: string;
}

interface PaymentResult {
  statusCode: number;
  status: string;
  message: string;
  data?: any;
}

class PaymentService {
  async initiatePayment(data: PaymentData): Promise<PaymentResult> {
    try {
      const reference = `LW_${nanoid(10)}_${Date.now()}`;
      const provider = data.payment_provider || 'paystack';

      let providerResponse;
      
      if (provider === 'paystack') {
        providerResponse = await PaystackService.initializeTransaction({
          amount: data.amount,
          email: data.email,
          currency: data.currency || 'NGN',
          reference,
          callback_url: `${process.env.BASE_URL}/api/v1/payment/callback`,
          metadata: {
            user_id: data.user_id,
            plan_id: data.plan_id,
          },
        });
      } else {
        providerResponse = await FlutterwaveService.initializePayment({
          amount: data.amount,
          currency: data.currency || 'NGN',
          email: data.email,
          tx_ref: reference,
          redirect_url: `${process.env.BASE_URL}/api/v1/payment/callback`,
          meta: {
            user_id: data.user_id,
            plan_id: data.plan_id,
          },
        });
      }

      // Save payment record
      await Payment.create({
        payment_id: nanoid(),
        resident_id: data.user_id || nanoid(),
        amount: data.amount,
        payment_date: new Date(),
        status: 'pending',
        reference,
        provider,
        provider_response: JSON.stringify(providerResponse),
      });

      return {
        statusCode: 200,
        status: 'success',
        message: 'Payment initialized successfully',
        data: {
          reference,
          authorization_url: provider === 'paystack' 
            ? providerResponse.data.authorization_url 
            : providerResponse.data.link,
          access_code: providerResponse.data.access_code,
        },
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        status: 'error',
        message: error.message || 'Payment initialization failed',
      };
    }
  }

  async verifyPayment(data: { reference: string }): Promise<PaymentResult> {
    try {
      const payment = await Payment.findOne({ where: { reference: data.reference } });
      
      if (!payment) {
        return {
          statusCode: 404,
          status: 'error',
          message: 'Payment not found',
        };
      }

      let verificationResponse;
      
      if (payment.provider === 'paystack') {
        verificationResponse = await PaystackService.verifyTransaction(data.reference);
      } else {
        // For Flutterwave, we need transaction ID from webhook
        const providerData = JSON.parse(payment.provider_response || '{}');
        verificationResponse = await FlutterwaveService.verifyTransaction(
          providerData.data?.id || data.reference
        );
      }

      const isSuccessful = payment.provider === 'paystack' 
        ? verificationResponse.data.status === 'success'
        : verificationResponse.data.status === 'successful';

      // Update payment status
      await payment.update({
        status: isSuccessful ? 'completed' : 'failed',
        provider_response: JSON.stringify(verificationResponse),
      });

      // Handle subscription if payment is for a plan
      if (isSuccessful && payment.plan_id) {
        await this.handleSubscriptionPayment(payment);
      }

      return {
        statusCode: 200,
        status: isSuccessful ? 'success' : 'failed',
        message: isSuccessful ? 'Payment verified successfully' : 'Payment verification failed',
        data: {
          payment_status: payment.status,
          amount: payment.amount,
          reference: payment.reference,
        },
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        status: 'error',
        message: error.message || 'Payment verification failed',
      };
    }
  }

  private async handleSubscriptionPayment(payment: any): Promise<void> {
    try {
      const plan = await Plan.findByPk(payment.plan_id);
      if (!plan) return;

      const endDate = new Date();
      switch (plan.billing_cycle) {
        case 'monthly':
          endDate.setMonth(endDate.getMonth() + 1);
          break;
        case 'quarterly':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case 'biannually':
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case 'annually':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      await Subscription.create({
        id: nanoid(),
        user_id: payment.resident_id,
        plan_id: payment.plan_id,
        status: 'active',
        start_date: new Date(),
        end_date: endDate,
      });
    } catch (error) {
      console.error('Subscription creation failed:', error);
    }
  }

  async handlePaymentFailure(reference: string, reason: string): Promise<void> {
    try {
      const payment = await Payment.findOne({ where: { reference } });
      if (payment) {
        await payment.update({
          status: 'failed',
          failure_reason: reason,
        });
        
        // Send failure notification
        // await NotificationService.sendPaymentFailureNotification(payment);
      }
    } catch (error) {
      console.error('Payment failure handling error:', error);
    }
  }

  async getAllPayments(options: { limit: number; offset: number; status?: string }): Promise<PaymentResult> {
    try {
      const whereClause = options.status ? { status: options.status } : {};
      
      const payments = await Payment.findAndCountAll({
        where: whereClause,
        limit: options.limit,
        offset: options.offset,
        order: [['created_at', 'DESC']],
      });

      return {
        statusCode: 200,
        status: 'success',
        message: 'Payments retrieved successfully',
        data: {
          payments: payments.rows,
          total: payments.count,
          page: Math.floor(options.offset / options.limit) + 1,
          totalPages: Math.ceil(payments.count / options.limit),
        },
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        status: 'error',
        message: error.message || 'Failed to retrieve payments',
      };
    }
  }

  async getPaymentById(paymentId: string): Promise<PaymentResult> {
    try {
      const payment = await Payment.findByPk(paymentId);
      
      if (!payment) {
        return {
          statusCode: 404,
          status: 'error',
          message: 'Payment not found',
        };
      }

      return {
        statusCode: 200,
        status: 'success',
        message: 'Payment retrieved successfully',
        data: payment,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        status: 'error',
        message: error.message || 'Failed to retrieve payment',
      };
    }
  }

  async getPaymentByReference(reference: string): Promise<PaymentResult> {
    try {
      const payment = await Payment.findOne({ where: { reference } });
      
      if (!payment) {
        return {
          statusCode: 404,
          status: 'error',
          message: 'Payment not found',
        };
      }

      return {
        statusCode: 200,
        status: 'success',
        message: 'Payment retrieved successfully',
        data: payment,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        status: 'error',
        message: error.message || 'Failed to retrieve payment',
      };
    }
  }
}

export const paymentService = new PaymentService();