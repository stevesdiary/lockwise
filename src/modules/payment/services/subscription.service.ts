import { nanoid } from 'nanoid';
import { Subscription } from '../../payment/models/subscription.model';
import { Plan } from '../../payment/models/plan.model';
import { Estate } from '../../estate/models/estate.model';
import { paymentService } from '../../payment/services/payment.service';

interface SubscriptionData {
  estate_id: string;
  plan_id: string;
  payment_method?: string;
  user_email: string;
}

class SubscriptionService {
  async createSubscription(data: SubscriptionData) {
    try {
      const plan = await Plan.findByPk(data.plan_id);
      const estate = await Estate.findByPk(data.estate_id);

      if (!plan || !estate) {
        throw new Error('Plan or estate not found');
      }

      // Check for existing active subscription
      const existingSubscription = await Subscription.findOne({
        where: {
          estata_id: data.estate_id,
          status: 'active'
        }
      });

      if (existingSubscription) {
        throw new Error('Estate already has an active subscription');
      }

      // Create pending subscription
      const subscription = await Subscription.create({
        estata_id: data.estate_id,
        plan_id: data.plan_id,
        status: 'inactive',
        start_date: new Date(),
        end_date: new Date(),
        paid_on: new Date(),
      });

      // Initiate payment for subscription
      const paymentResult = await paymentService.initiatePayment({
        amount: parseFloat(plan.price.toString()),
        email: data.user_email,
        currency: plan.currency || 'NGN',
        payment_method: data.payment_method || 'card',
        estate_id: data.estate_id,
        subscription_id: subscription.id,
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

  async cancelSubscription(subscriptionId: string, estateId: string) {
    try {
      const subscription = await Subscription.findOne({
        where: {
          id: subscriptionId,
          estata_id: estateId,
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

  async renewSubscription(subscriptionId: string, userEmail: string) {
    try {
      const subscription = await Subscription.findByPk(subscriptionId, {
        include: [Plan, Estate]
      });

      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const plan = subscription.plan;
      const estate = subscription.estate;

      // Initiate renewal payment
      const paymentResult = await paymentService.initiatePayment({
        amount: parseFloat(plan.price.toString()),
        email: userEmail,
        currency: plan.currency || 'NGN',
        payment_method: 'card',
        estate_id: estate.id,
        subscription_id: subscription.id,
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

  async getEstateSubscriptions(estateId: string) {
    try {
      const subscriptions = await Subscription.findAll({
        where: { estata_id: estateId },
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