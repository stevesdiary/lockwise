import { Transaction, Op } from 'sequelize';
import sequelize from '../../../shared/core/database';
import { Subscription } from '../../payment/models/subscription.model';
import { Plan } from '../../payment/models/plan.model';
import { Estate } from '../../estate/models/estate.model';
import { Payment } from '../../payment/models/payment.model';
import PaystackService from './paystack.service';
import { nanoid } from 'nanoid';

interface SubscriptionData {
  estate_id: string;
  plan_id: string;
  payment_method?: string;
  payment_provider?: 'paystack';
  user_id: string;
  user_email: string;
}

class SubscriptionService {
  async createSubscription(data: SubscriptionData) {
    try {
      // 1. Pre-flight validation (outside transaction — no locks held yet)
      const [plan, estate] = await Promise.all([
        Plan.findByPk(data.plan_id),
        Estate.findByPk(data.estate_id),
      ]);

      if (!plan || !estate) {
        throw new Error('Plan or estate not found');
      }

      const existingSubscription = await Subscription.findOne({
        where: { estate_id: data.estate_id, status: 'active' },
      });

      if (existingSubscription) {
        throw new Error('Estate already has an active subscription');
      }

      // 2. Call Paystack BEFORE opening a DB transaction (external I/O must not hold DB locks)
      const reference = `LW_${nanoid(10)}_${Date.now()}`;
      const providerResponse = await PaystackService.initializeTransaction({
        amount: parseFloat(plan.price.toString()),
        email: data.user_email,
        currency: plan.currency || 'NGN',
        reference,
        callback_url: `${process.env.BASE_URL}/api/v1/payment/callback`,
        metadata: {
          user_id: data.user_id,
          estate_id: data.estate_id,
        },
      });

      // 3. Atomically persist subscription + payment record
      await sequelize.transaction(async (t: Transaction) => {
        const subscription = await Subscription.create(
          {
            estate_id: data.estate_id,
            plan_id: data.plan_id,
            status: 'inactive',
            start_date: new Date(),
            end_date: new Date(),
          },
          { transaction: t },
        );

        await Payment.create(
          {
            user_id: data.user_id,
            estate_id: data.estate_id,
            subscription_id: subscription.id,
            amount: parseFloat(plan.price.toString()),
            payment_date: new Date(),
            payment_status: 'pending',
            reference,
            payment_provider: 'paystack',
            payment_method: 'paystack',
            email: data.user_email,
            payment_data: providerResponse,
          },
          { transaction: t },
        );
      });

      return {
        statusCode: 200,
        status: 'success',
        message: 'Subscription payment initiated',
        data: {
          reference,
          authorization_url: providerResponse.data.authorization_url,
          access_code: providerResponse.data.access_code,
        },
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        status: 'error',
        message: error.message,
      };
    }
  }

  async cancelSubscription(subscriptionId: string, estateId: string) {
    try {
      const subscription = await Subscription.findOne({
        where: {
          id: subscriptionId,
          estate_id: estateId,
        }
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      await subscription.update({
        status: 'cancelled',
        cancel_reason: 'User requested cancellation',
      });

      return {
        statusCode: 200,
        status: 'success',
        message: 'Subscription cancelled successfully',
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        status: 'error',
        message: error.message,
      };
    }
  }

  async renewSubscription(subscriptionId: string, userId: string, userEmail: string) {
    try {
      const subscription = await Subscription.findByPk(subscriptionId, {
        include: [Plan, Estate],
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const plan = subscription.plan;
      const estateId = subscription.estate?.estate_id || (subscription.estate as any)?.id;

      // Call Paystack BEFORE opening a DB transaction
      const reference = `LW_${nanoid(10)}_${Date.now()}`;
      const providerResponse = await PaystackService.initializeTransaction({
        amount: parseFloat(plan.price.toString()),
        email: userEmail,
        currency: plan.currency || 'NGN',
        reference,
        callback_url: `${process.env.BASE_URL}/api/v1/payment/callback`,
        metadata: { user_id: userId, estate_id: estateId, subscription_id: subscription.id },
      });

      // Atomically persist renewal payment record
      await sequelize.transaction(async (t: Transaction) => {
        await Payment.create(
          {
            user_id: userId,
            estate_id: estateId,
            subscription_id: subscription.id,
            amount: parseFloat(plan.price.toString()),
            payment_date: new Date(),
            payment_status: 'pending',
            reference,
            payment_provider: 'paystack',
            payment_method: 'paystack',
            email: userEmail,
            payment_data: providerResponse,
          },
          { transaction: t },
        );
      });

      return {
        statusCode: 200,
        status: 'success',
        message: 'Subscription renewal initiated',
        data: {
          reference,
          authorization_url: providerResponse.data.authorization_url,
          access_code: providerResponse.data.access_code,
        },
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        status: 'error',
        message: error.message,
      };
    }
  }

  async getEstateSubscriptions(estateId: string) {
    try {
      const subscriptions = await Subscription.findAll({
        where: { estate_id: estateId },
        include: [Plan],
        order: [['created_at', 'DESC']],
      });

      return {
        statusCode: 200,
        status: 'success',
        data: subscriptions,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        status: 'error',
        message: error.message,
      };
    }
  }

  async getCurrentSubscriptionForEstate(estateId: string) {
    try {
      const subscription = await Subscription.findOne({
        where: {
          estate_id: estateId,
          status: {
            [Op.in]: ['active', 'inactive']
          }
        },
        include: [Plan],
        order: [['end_date', 'DESC']]
      });

      if (subscription) {
        return {
          statusCode: 200,
          status: 'success',
          message: 'Current subscription retrieved successfully',
          data: subscription,
        };
      }

      const latestSubscription = await Subscription.findOne({
        where: { estate_id: estateId },
        include: [Plan],
        order: [['created_at', 'DESC']]
      });

      return {
        statusCode: 200,
        status: 'success',
        message: latestSubscription
          ? 'Latest subscription retrieved successfully'
          : 'No subscription found for this estate',
        data: latestSubscription || null,
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        status: 'error',
        message: error.message || 'Failed to retrieve current subscription',
      };
    }
  }

  async checkExpiredSubscriptions() {
    try {
      const expiredSubscriptions = await Subscription.findAll({
        where: {
          status: 'active',
          end_date: {
            [Op.lt]: new Date(),
          },
        },
      });

      for (const subscription of expiredSubscriptions) {
        await subscription.update({ status: 'expired' });
        
        // Send expiration notification
        console.log(`Subscription expired: ${subscription.id}`);
      }

      return expiredSubscriptions.length;
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
      return 0;
    }
  }
}

export default new SubscriptionService();
