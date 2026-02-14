import { nanoid } from 'nanoid';
import { Payment } from '../../payment/models/payment.model';
import { Subscription } from '../../payment/models/subscription.model';
import { Plan } from '../../payment/models/plan.model';
import PaystackService from './paystack.service';
import FlutterwaveService from './flutterwave.service';

interface PaymentData {
  amount: number;
  email: string;
  currency?: string;
  payment_provider?: 'paystack' | 'flutterwave';
  payment_method: string;
  user_id?: string;
  estate_id?: string;
  subscription_id?: string;
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
            estate_id: data.estate_id,
            subscription_id: data.subscription_id,
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
            estate_id: data.estate_id,
            subscription_id: data.subscription_id,
          },
        });
      }

      // Save payment record
      await Payment.create({
        user_id: data.user_id || nanoid(),
        estate_id: data.estate_id,
        subscription_id: data.subscription_id,
        amount: data.amount,
        payment_date: new Date(),
        payment_status: 'pending',
        reference,
        payment_provider: provider,
        payment_method: data.payment_method,
        email: data.email,
        payment_data: providerResponse,
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
      
      if (payment.payment_provider === 'paystack') {
        verificationResponse = await PaystackService.verifyTransaction(data.reference);
      } else {
        // For Flutterwave, we need transaction ID from webhook
        const providerData = payment.payment_data as any || {};
        verificationResponse = await FlutterwaveService.verifyTransaction(
          providerData.data?.id || data.reference
        );
      }

      const isSuccessful = payment.payment_provider === 'paystack' 
        ? verificationResponse.data.status === 'success'
        : verificationResponse.data.status === 'successful';

      // Update payment status
      await payment.update({
        payment_status: isSuccessful ? 'completed' : 'failed',
        payment_data: verificationResponse,
      });

      // Handle subscription if payment is for a plan
      if (isSuccessful && payment.subscription_id) {
        await this.handleSubscriptionPayment(payment);
      }

      return {
        statusCode: 200,
        status: isSuccessful ? 'success' : 'failed',
        message: isSuccessful ? 'Payment verified successfully' : 'Payment verification failed',
        data: {
          payment_status: payment.payment_status,
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
      const subscription = await Subscription.findByPk(payment.subscription_id, { include: [Plan] });
      if (!subscription || !subscription.plan) return;

      const endDate = new Date();
      switch (subscription.plan.billing_cycle) {
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

      await subscription.update({
        status: 'active',
        start_date: new Date(),
        end_date: endDate,
      });
    } catch (error) {
      console.error('Subscription update failed:', error);
    }
  }

  async handlePaymentFailure(reference: string, reason: string): Promise<void> {
    try {
      const payment = await Payment.findOne({ where: { reference } });
      if (payment) {
        await payment.update({
          payment_status: 'failed',
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
      const whereClause = options.status ? { payment_status: options.status } : {};
      
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