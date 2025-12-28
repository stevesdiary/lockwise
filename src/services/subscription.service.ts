import { nanoid } from 'nanoid';
import { Subscription } from '../models/subscription.model';
import { Plan } from '../models/plan.model';
import { User } from '../models/user.model';
import { paymentService } from './payment.service';

interface SubscriptionData {
  user_id: string;
  plan_id: string;
  payment_method?: string;
}

class SubscriptionService {
  async createSubscription(data: SubscriptionData) {
    try {
      const plan = await Plan.findByPk(data.plan_id);
      const user = await User.findByPk(data.user_id);

      if (!plan || !user) {
        throw new Error('Plan or user not found');
      }

      // Check for existing active subscription
      const existingSubscription = await Subscription.findOne({
        where: {
          user_id: data.user_id,
          status: 'active'
        }
      });

      if (existingSubscription) {
        throw new Error('User already has an active subscription');
      }

      // Initiate payment for subscription
      const paymentResult = await paymentService.initiatePayment({
        amount: parseFloat(plan.price.toString()),
        email: user.email,
        currency: plan.currency || 'NGN',
        payment_method: data.payment_method || 'card',
        user_id: data.user_id,
        plan_id: data.plan_id,
      });

      if (paymentResult.statusCode !== 200) {
        throw new Error('Payment initialization failed');
      }

      return {
        statusCode: 200,
        status: 'success',
        message: 'Subscription payment initiated',
        data: paymentResult.data,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        status: 'error',
        message: error.message,
      };
    }
  }

  async cancelSubscription(subscriptionId: string, userId: string) {
    try {
      const subscription = await Subscription.findOne({
        where: {
          id: subscriptionId,
          user_id: userId,
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

  async renewSubscription(subscriptionId: string) {
    try {
      const subscription = await Subscription.findByPk(subscriptionId, {
        include: [Plan, User]
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const plan = subscription.plan;
      const user = subscription.user;

      // Initiate renewal payment
      const paymentResult = await paymentService.initiatePayment({
        amount: parseFloat(plan.price.toString()),
        email: user.email,
        currency: plan.currency || 'NGN',
        payment_method: 'card',
        user_id: user.id,
        plan_id: plan.id,
      });

      return {
        statusCode: 200,
        status: 'success',
        message: 'Subscription renewal initiated',
        data: paymentResult.data,
      };
    } catch (error: any) {
      return {
        statusCode: 400,
        status: 'error',
        message: error.message,
      };
    }
  }

  async getUserSubscriptions(userId: string) {
    try {
      const subscriptions = await Subscription.findAll({
        where: { user_id: userId },
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

  async checkExpiredSubscriptions() {
    try {
      const expiredSubscriptions = await Subscription.findAll({
        where: {
          status: 'active',
          end_date: {
            [require('sequelize').Op.lt]: new Date(),
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