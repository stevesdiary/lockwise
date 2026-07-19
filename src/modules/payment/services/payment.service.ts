import { nanoid } from 'nanoid';
import { Transaction } from 'sequelize';
import sequelize from '../../../shared/core/database';
import { Payment } from '../../payment/models/payment.model';
import { Subscription } from '../../payment/models/subscription.model';
import { Plan } from '../../payment/models/plan.model';
import { Estate } from '../../estate/models/estate.model';
import PaystackService from './paystack.service';
import { referralService } from './referral.service';

interface PaymentData {
  amount: number;
  email: string;
  currency?: string;
  payment_provider?: 'paystack';
  payment_method: string;
  user_id: string;
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
  private normalizePaymentMethod(method: string): 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'POS' | 'paystack' {
    const normalized = method.trim().toLowerCase();
    if (normalized === 'card') return 'credit_card';
    if (normalized === 'credit_card') return 'credit_card';
    if (normalized === 'debit_card') return 'debit_card';
    if (normalized === 'bank_transfer') return 'bank_transfer';
    if (normalized === 'cash') return 'cash';
    if (normalized === 'pos') return 'POS';
    if (normalized === 'paystack') return 'paystack';
    return 'credit_card';
  }

  async initiatePayment(data: PaymentData): Promise<PaymentResult> {
    try {
      if (!data.user_id) {
        return {
          statusCode: 400,
          status: 'error',
          message: 'User ID is required to initiate payment',
        };
      }

      const reference = `LW_${nanoid(10)}_${Date.now()}`;
      const paymentMethod = this.normalizePaymentMethod(data.payment_method);

      const providerResponse = await PaystackService.initializeTransaction({
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

      // Save payment record
      await Payment.create({
        user_id: data.user_id,
        estate_id: data.estate_id,
        subscription_id: data.subscription_id,
        amount: data.amount,
        payment_date: new Date(),
        payment_status: 'pending',
        reference,
        payment_provider: 'paystack',
        payment_method: paymentMethod,
        email: data.email,
        payment_data: providerResponse,
      });

      return {
        statusCode: 200,
        status: 'success',
        message: 'Payment initialized successfully',
        data: {
          reference,
          authorization_url: providerResponse.data.authorization_url,
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

      // Idempotency: skip re-processing if already completed
      if (payment.payment_status === 'completed') {
        return {
          statusCode: 200,
          status: 'success',
          message: 'Payment already verified',
          data: {
            payment_status: payment.payment_status,
            amount: payment.amount,
            reference: payment.reference,
          },
        };
      }

      // Verify with Paystack BEFORE opening the DB transaction (external call)
      const verificationResponse = await PaystackService.verifyTransaction(data.reference);
      const isSuccessful = verificationResponse.data.status === 'success';

      // Atomically: update payment + activate subscription + record referral bonus
      await sequelize.transaction(
        { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
        async (t) => {
          await payment.update(
            { payment_status: isSuccessful ? 'completed' : 'failed', payment_data: verificationResponse },
            { transaction: t },
          );

          if (isSuccessful && payment.subscription_id) {
            await this.handleSubscriptionPayment(payment, t);
          }

          if (isSuccessful && payment.estate_id) {
            await referralService.createBonusOnPayment(payment.estate_id, payment.amount, t).catch((err: Error) => {
              console.error('Referral bonus creation failed:', err);
            });
          }
        },
      );

      return {
        statusCode: 200,
        status: isSuccessful ? 'success' : 'failed',
        message: isSuccessful ? 'Payment verified successfully' : 'Payment verification failed',
        data: {
          payment_status: isSuccessful ? 'completed' : 'failed',
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

  private async handleSubscriptionPayment(payment: any, t?: Transaction): Promise<void> {
    const subscription = await Subscription.findByPk(payment.subscription_id, {
      include: [Plan],
      transaction: t,
    });
    if (!subscription || !subscription.plan) return;

    const endDate = new Date();
    switch (subscription.plan.billing_cycle) {
      case 'monthly':    endDate.setMonth(endDate.getMonth() + 1);         break;
      case 'quarterly':  endDate.setMonth(endDate.getMonth() + 3);         break;
      case 'biannually': endDate.setMonth(endDate.getMonth() + 6);         break;
      case 'annually':   endDate.setFullYear(endDate.getFullYear() + 1);   break;
    }

    await subscription.update(
      {
        status: 'active',
        subscription_state: 'ACTIVE',
        start_date: new Date(),
        end_date: endDate,
        paid_on: new Date(),
        grace_period_end_date: null,
        lapsed_start_date: null,
      },
      { transaction: t },
    );
  }

  async handlePaymentFailure(reference: string, _reason: string): Promise<void> {
    try {
      await sequelize.transaction(
        { isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE },
        async (t) => {
          const payment = await Payment.findOne({ where: { reference }, transaction: t });
          if (!payment) return;

          await payment.update({ payment_status: 'failed' }, { transaction: t });

          // Keep linked subscription inactive; only update if it hasn't been
          // activated by a concurrent webhook (status guard prevents overwrite)
          if (payment.subscription_id) {
            await Subscription.update(
              { status: 'inactive' },
              { where: { id: payment.subscription_id, status: 'inactive' }, transaction: t },
            );
          }
        },
      );
    } catch (error) {
      console.error('Payment failure handling error:', error);
    }
  }

  async getAllPayments(options: {
    limit: number;
    offset: number;
    status?: string;
    user_id?: string;
    estate_id?: string;
  }): Promise<PaymentResult> {
    try {
      const whereClause: Record<string, any> = {};
      if (options.status) whereClause.payment_status = options.status;
      if (options.user_id) whereClause.user_id = options.user_id;
      if (options.estate_id) whereClause.estate_id = options.estate_id;
      
      const payments = await Payment.findAndCountAll({
        where: whereClause,
        include: [
          { model: Estate, attributes: ['estate_id', 'name'] },
          { model: Subscription, include: [{ model: Plan, attributes: ['id', 'name', 'billing_cycle'] }] },
        ],
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

  async getPaymentById(
    paymentId: string,
    options: { user_id?: string; estate_id?: string } = {}
  ): Promise<PaymentResult> {
    try {
      const whereClause: Record<string, any> = { id: paymentId };
      if (options.user_id) whereClause.user_id = options.user_id;
      if (options.estate_id) whereClause.estate_id = options.estate_id;

      const payment = await Payment.findOne({ where: whereClause });
      
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

  async getPaymentByReference(
    reference: string,
    options: { user_id?: string; estate_id?: string } = {}
  ): Promise<PaymentResult> {
    try {
      const whereClause: Record<string, any> = { reference };
      if (options.user_id) whereClause.user_id = options.user_id;
      if (options.estate_id) whereClause.estate_id = options.estate_id;

      const payment = await Payment.findOne({ where: whereClause });
      
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
