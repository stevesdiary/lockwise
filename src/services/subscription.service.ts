import { Subscription } from '../models/subscription.model';
import { User } from '../models/user.model';
import { Plan } from '../models/plan.model';

export const subscriptionService = {
  createSubscription: async (data: {
    user_id: string;
    plan_id: string;
    estate_id: string;
    duration_months: number;
  }) => {
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + data.duration_months);

    return await Subscription.create({
      user_id: data.user_id,
      plan_id: data.plan_id,
      estate_id: data.estate_id,
      status: 'active',
      start_date: new Date(),
      end_date: endDate
    });
  },

  getUserSubscription: async (user_id: string, estate_id?: string) => {
    return await Subscription.findOne({
      where: {
        user_id,
        ...(estate_id && { estate_id }),
        status: 'active'
      },
      include: [
        { model: Plan, attributes: ['name', 'price', 'features'] },
        { model: User, attributes: ['first_name', 'last_name', 'email'] }
      ]
    });
  },

  checkSubscriptionStatus: async (user_id: string, estate_id: string) => {
    const subscription = await Subscription.findOne({
      where: { user_id, estate_id, status: 'active' }
    });

    if (!subscription) return { valid: false, reason: 'No active subscription' };
    
    if (new Date() > subscription.end_date) {
      await subscription.update({ status: 'expired' });
      return { valid: false, reason: 'Subscription expired' };
    }

    return { valid: true, subscription };
  },

  renewSubscription: async (subscription_id: string, duration_months: number) => {
    const subscription = await Subscription.findByPk(subscription_id);
    if (!subscription) throw new Error('Subscription not found');

    const newEndDate = new Date(subscription.end_date);
    newEndDate.setMonth(newEndDate.getMonth() + duration_months);

    return await subscription.update({
      end_date: newEndDate,
      status: 'active'
    });
  }
};
