import { Transaction, Op } from 'sequelize';
import sequelize from '../../../shared/core/database';
import { Subscription } from '../../payment/models/subscription.model';
import { Plan } from '../../payment/models/plan.model';
import { Estate } from '../../estate/models/estate.model';
import { Payment } from '../../payment/models/payment.model';
import PaystackService from './paystack.service';
import { nanoid } from 'nanoid';
import { notifySlackSubscriptionCancelled } from '../../../shared/utils/slack.service';

function applySubscriptionDiscount(amount: number, billingCycle: string): number {
  let discountPercent = 0;
  if (billingCycle === 'biannually') {
    discountPercent = parseFloat(process.env.BIANNUAL_DISCOUNT_PERCENT || '0');
  } else if (billingCycle === 'annually') {
    discountPercent = parseFloat(process.env.ANNUAL_DISCOUNT_PERCENT || '0');
  }
  if (discountPercent <= 0) return amount;
  return parseFloat((amount * (1 - discountPercent / 100)).toFixed(2));
}

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
      const baseAmount = parseFloat(plan.price.toString());
      const finalAmount = applySubscriptionDiscount(baseAmount, plan.billing_cycle);

      const reference = `LW_${nanoid(10)}_${Date.now()}`;
      const providerResponse = await PaystackService.initializeTransaction({
        amount: finalAmount,
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
            amount: finalAmount,
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
        },
        include: [Plan, Estate],
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      await subscription.update({
        status: 'cancelled',
        cancel_reason: 'User requested cancellation',
      });

      notifySlackSubscriptionCancelled({
        estateId,
        estateName: (subscription as any).estate?.name ?? 'Unknown Estate',
        planName: (subscription as any).plan?.name ?? 'Unknown Plan',
        status: 'cancelled',
        cancelledAt: new Date(),
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
      const baseAmount = parseFloat(plan.price.toString());
      const finalAmount = applySubscriptionDiscount(baseAmount, plan.billing_cycle);

      const reference = `LW_${nanoid(10)}_${Date.now()}`;
      const providerResponse = await PaystackService.initializeTransaction({
        amount: finalAmount,
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
            amount: finalAmount,
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

  async provisionFreePlan(estateId: string): Promise<Subscription | null> {
    try {
      const freePlan = await Plan.findOne({ where: { name: 'Free' } as any });
      if (!freePlan) return null;

      const now = new Date();
      const end = new Date(now);
      end.setFullYear(end.getFullYear() + 1);

      const sub = await Subscription.create({
        estate_id: estateId,
        plan_id: (freePlan as any).id,
        status: 'active',
        start_date: now,
        end_date: end,
        auto_renew: true,
        paid_on: null,
      } as any);

      return Subscription.findByPk((sub as any).id, { include: [Plan] });
    } catch {
      return null;
    }
  }

  async getResidentCount(estateId: string): Promise<number> {
    const { User } = await import('../../auth/models/user.model');
    return User.count({ where: { estate_id: estateId, user_type: 'resident' } as any });
  }

  async getCurrentSubscriptionForEstate(estateId: string) {
    try {
      const now = new Date();
      
      // Only return truly active or grace period subscriptions
      const subscription = await Subscription.findOne({
        where: {
          estate_id: estateId,
          status: {
            [Op.in]: ['active', 'grace_period']
          }
        },
        include: [Plan],
        order: [
          // active > grace_period
          [sequelize.literal(`CASE status WHEN 'active' THEN 0 WHEN 'grace_period' THEN 1 END`), 'ASC'],
          ['created_at', 'DESC'],
        ],
      });

      if (subscription) {
        // Double-check if subscription is actually expired (in case cron hasn't run)
        if (subscription.status === 'active' && subscription.end_date < now) {
          // Subscription expired but cron hasn't processed it yet
          return {
            statusCode: 200,
            status: 'success',
            message: 'Subscription expired',
            data: null,
          };
        }
        
        if (subscription.status === 'grace_period' && subscription.grace_period_end_date && subscription.grace_period_end_date < now) {
          // Grace period ended but cron hasn't processed it yet
          return {
            statusCode: 200,
            status: 'success',
            message: 'Subscription expired',
            data: null,
          };
        }
        
        return {
          statusCode: 200,
          status: 'success',
          message: 'Current subscription retrieved successfully',
          data: subscription,
        };
      }

      // No active/grace subscription found
      return {
        statusCode: 200,
        status: 'success',
        message: 'No active subscription found for this estate',
        data: null,
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
      const now = new Date();
      
      // 1. Active subscriptions that have passed end_date → grace_period
      const activeExpired = await Subscription.findAll({
        where: {
          status: 'active',
          end_date: {
            [Op.lt]: now,
          },
        },
      });

      for (const subscription of activeExpired) {
        const gracePeriodEnd = new Date(subscription.end_date);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7); // 7 days grace period
        
        await subscription.update({ 
          status: 'grace_period',
          grace_period_end_date: gracePeriodEnd
        });
        
        console.log(`Subscription ${subscription.id} moved to grace_period`);
      }
      
      // 2. Grace period subscriptions that have passed grace_period_end_date → expired
      const graceExpired = await Subscription.findAll({
        where: {
          status: 'grace_period',
          grace_period_end_date: {
            [Op.lt]: now,
          },
        },
        include: [Plan, Estate],
      });

      for (const subscription of graceExpired) {
        await subscription.update({ status: 'expired' });
        console.log(`Subscription ${subscription.id} expired`);

        notifySlackSubscriptionCancelled({
          estateId: subscription.estate_id,
          estateName: (subscription as any).estate?.name ?? 'Unknown Estate',
          planName: (subscription as any).plan?.name ?? 'Unknown Plan',
          status: 'expired',
          cancelledAt: new Date(),
        });
      }

      return activeExpired.length + graceExpired.length;
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
      return 0;
    }
  }
}

export default new SubscriptionService();
