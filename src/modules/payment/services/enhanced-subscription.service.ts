import { Transaction, Op } from 'sequelize';
import sequelize from '../../../shared/core/database';
import { Subscription } from '../models/subscription.model';
import { Plan } from '../models/plan.model';
import { Estate } from '../../estate/models/estate.model';
import { Payment } from '../models/payment.model';
import { User } from '../../auth/models/user.model';
import PaystackService from './paystack.service';
import subscriptionEventService from './subscription-event.service';
import { getFeatureFlags, getDaysSinceLapsed } from '../types/feature-flags.types';
import { nanoid } from 'nanoid';

const TRIAL_DAYS = 30;
const GRACE_PERIOD_DAYS = 7;

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

class EnhancedSubscriptionService {
  // Start trial when first resident is approved
  async startTrialForEstate(estateId: string): Promise<Subscription | null> {
    try {
      // Check if trial already exists
      const existing = await Subscription.findOne({
        where: { estate_id: estateId },
      });

      if (existing) {
        return existing;
      }

      const now = new Date();
      const trialEnd = addDays(now, TRIAL_DAYS);

      const subscription = await Subscription.create({
        estate_id: estateId,
        plan_id: null as any, // No plan during trial
        subscription_state: 'TRIAL',
        status: 'active',
        trial_start_date: now,
        trial_end_date: trialEnd,
        start_date: now,
        end_date: trialEnd,
        resident_count: 0,
        auto_renew: false,
      } as any);

      // Log event
      await subscriptionEventService.logEvent({
        subscriptionId: subscription.id,
        estateId,
        eventType: 'trial_started',
        newState: 'TRIAL',
        triggerReason: 'First resident approved',
        metadata: { trial_end_date: trialEnd.toISOString() },
      });

      return subscription;
    } catch (error: any) {
      console.error('Failed to start trial:', error);
      return null;
    }
  }

  // Select plan and initiate payment
  async selectPlan(data: {
    estateId: string;
    planId: string;
    billingCycle: 'monthly' | 'quarterly' | 'annually';
    userId: string;
    userEmail: string;
  }) {
    try {
      const [plan, estate, subscription] = await Promise.all([
        Plan.findByPk(data.planId),
        Estate.findByPk(data.estateId),
        Subscription.findOne({
          where: { estate_id: data.estateId },
          order: [['created_at', 'DESC']],
        }),
      ]);

      if (!plan || !estate) {
        throw new Error('Plan or estate not found');
      }

      // Enterprise plans require manual invoice
      if (plan.plan_tier === 'enterprise') {
        throw new Error('Enterprise plans require manual setup. Please contact sales.');
      }

      // Verify billing cycle matches plan
      if (plan.billing_cycle !== data.billingCycle) {
        throw new Error('Billing cycle does not match selected plan');
      }

      const amount = parseFloat(plan.price.toString());
      const reference = `LW_SUB_${nanoid(10)}_${Date.now()}`;

      // Initialize Paystack transaction
      const providerResponse = await PaystackService.initializeTransaction({
        amount,
        email: data.userEmail,
        currency: 'NGN',
        reference,
        callback_url: `${process.env.BASE_URL}/api/v1/payment/subscription/callback`,
        metadata: {
          user_id: data.userId,
          estate_id: data.estateId,
          plan_id: data.planId,
          billing_cycle: data.billingCycle,
          subscription_id: subscription?.id,
        },
      });

      // Create payment record
      await Payment.create({
        user_id: data.userId,
        estate_id: data.estateId,
        subscription_id: subscription?.id,
        amount,
        payment_date: new Date(),
        payment_status: 'pending',
        reference,
        payment_provider: 'paystack',
        payment_method: 'paystack',
        email: data.userEmail,
        payment_data: providerResponse,
      } as any);

      // Log event
      if (subscription) {
        await subscriptionEventService.logEvent({
          subscriptionId: subscription.id,
          estateId: data.estateId,
          eventType: 'plan_selected',
          previousState: subscription.subscription_state,
          triggerReason: 'Estate selected a plan',
          metadata: { plan_id: data.planId, billing_cycle: data.billingCycle },
        });
      }

      return {
        statusCode: 200,
        status: 'success',
        message: 'Plan selection initiated',
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

  // Activate subscription after successful payment
  async activateSubscription(data: {
    estateId: string;
    planId: string;
    billingCycle: 'monthly' | 'quarterly' | 'annually';
    paystackSubscriptionCode?: string;
    paystackCustomerCode?: string;
  }): Promise<Subscription> {
    const plan = await Plan.findByPk(data.planId);
    if (!plan) throw new Error('Plan not found');

    const now = new Date();
    const duration = plan.duration || 30;
    const endDate = addDays(now, duration);
    const nextBillingDate = addDays(now, duration);

    const subscription = await Subscription.findOne({
      where: { estate_id: data.estateId },
      order: [['created_at', 'DESC']],
    });

    const previousState = subscription?.subscription_state;

    if (subscription) {
      await subscription.update({
        plan_id: data.planId,
        subscription_state: 'ACTIVE',
        status: 'active',
        billing_cycle: data.billingCycle,
        start_date: now,
        end_date: endDate,
        next_billing_date: nextBillingDate,
        paystack_subscription_code: data.paystackSubscriptionCode || null,
        paystack_customer_code: data.paystackCustomerCode || null,
        resident_cap: plan.resident_cap,
        paid_on: now,
        grace_period_end_date: null,
        lapsed_start_date: null,
      });

      await subscriptionEventService.logEvent({
        subscriptionId: subscription.id,
        estateId: data.estateId,
        eventType: 'subscription_activated',
        previousState,
        newState: 'ACTIVE',
        triggerReason: 'Payment successful',
        metadata: { plan_id: data.planId, billing_cycle: data.billingCycle },
      });

      return subscription;
    }

    // Create new subscription if none exists
    const newSub = await Subscription.create({
      estate_id: data.estateId,
      plan_id: data.planId,
      subscription_state: 'ACTIVE',
      status: 'active',
      billing_cycle: data.billingCycle,
      start_date: now,
      end_date: endDate,
      next_billing_date: nextBillingDate,
      paystack_subscription_code: data.paystackSubscriptionCode || null,
      paystack_customer_code: data.paystackCustomerCode || null,
      resident_cap: plan.resident_cap,
      resident_count: 0,
      paid_on: now,
      auto_renew: true,
    } as any);

    await subscriptionEventService.logEvent({
      subscriptionId: newSub.id,
      estateId: data.estateId,
      eventType: 'subscription_activated',
      newState: 'ACTIVE',
      triggerReason: 'Payment successful',
      metadata: { plan_id: data.planId, billing_cycle: data.billingCycle },
    });

    return newSub;
  }

  // Get subscription status for estate
  async getSubscriptionStatus(estateId: string) {
    try {
      const subscription = await Subscription.findOne({
        where: { estate_id: estateId },
        include: [Plan],
        order: [['created_at', 'DESC']],
      });

      if (!subscription) {
        // No subscription found - return default state prompting to subscribe
        return {
          statusCode: 200,
          status: 'success',
          data: {
            subscription_state: null,
            plan_name: null,
            plan_tier: null,
            billing_cycle: null,
            trial_end_date: null,
            next_billing_date: null,
            resident_count: await User.count({
              where: { estate_id: estateId, user_type: 'resident' },
            }),
            resident_cap: null,
            days_remaining: null,
            show_banner: true,
            banner_type: 'subscribe_required' as const,
            banner_message: 'No active subscription. Select a plan to get started.',
          },
        };
      }

      const now = new Date();
      let daysRemaining = 0;
      let showBanner = false;
      let bannerType: 'warning' | 'urgent' | 'critical' | null = null;
      let bannerMessage = '';

      // Calculate days remaining based on state
      if (subscription.subscription_state === 'TRIAL' && subscription.trial_end_date) {
        const diffMs = subscription.trial_end_date.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 7) {
          showBanner = true;
          bannerType = daysRemaining <= 3 ? 'urgent' : 'warning';
          bannerMessage = `Your trial expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Select a plan to continue.`;
        }
      } else if (subscription.subscription_state === 'GRACE' && subscription.grace_period_end_date) {
        const diffMs = subscription.grace_period_end_date.getTime() - now.getTime();
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        showBanner = true;
        bannerType = daysRemaining <= 3 ? 'critical' : 'urgent';
        bannerMessage = `Grace period ends in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Renew now to avoid service interruption.`;
      } else if (subscription.subscription_state === 'LAPSED' && subscription.lapsed_start_date) {
        const daysSinceLapsed = getDaysSinceLapsed(subscription.lapsed_start_date);
        showBanner = true;
        bannerType = 'critical';
        
        if (daysSinceLapsed <= 7) {
          bannerMessage = 'Your subscription has lapsed. Renew now to maintain full access.';
        } else if (daysSinceLapsed <= 14) {
          bannerMessage = 'Subscription lapsed. Reporting and analytics are now disabled.';
        } else if (daysSinceLapsed <= 21) {
          bannerMessage = 'Subscription lapsed. Visitor management and new staff registrations are disabled.';
        } else if (daysSinceLapsed <= 30) {
          bannerMessage = 'Subscription lapsed. Manager portal is now read-only.';
        } else {
          bannerMessage = 'Subscription suspended. Manager portal access is locked.';
        }
      } else if (subscription.subscription_state === 'ACTIVE' && subscription.end_date) {
        const diffMs = subscription.end_date.getTime() - now.getTime();
        const daysUntilExpiry = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        if (daysUntilExpiry <= 7) {
          showBanner = true;
          bannerType = daysUntilExpiry <= 3 ? 'urgent' : 'warning';
          bannerMessage = `Your subscription renews in ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''}.`;
        }
      }

      // Get feature flags
      const featureFlags = getFeatureFlags(
        subscription.subscription_state,
        subscription.lapsed_start_date
      );

      // Get resident count
      const residentCount = await User.count({
        where: { estate_id: estateId, user_type: 'resident' },
      });

      return {
        statusCode: 200,
        status: 'success',
        data: {
          subscription_state: subscription.subscription_state,
          plan_name: subscription.plan?.name || null,
          plan_tier: subscription.plan?.plan_tier || null,
          billing_cycle: subscription.billing_cycle,
          start_date: subscription.start_date,
          end_date: subscription.end_date,
          trial_end_date: subscription.trial_end_date,
          next_billing_date: subscription.next_billing_date,
          grace_period_end_date: subscription.grace_period_end_date,
          days_remaining: daysRemaining,
          show_banner: showBanner,
          banner_type: bannerType,
          banner_message: bannerMessage,
          resident_count: residentCount,
          resident_cap: subscription.plan?.resident_cap ?? subscription.resident_cap,
          auto_renew: subscription.auto_renew,
        },
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        status: 'error',
        message: error.message,
      };
    }
  }

  // Get feature flags for estate
  async getFeatures(estateId: string) {
    try {
      const subscription = await Subscription.findOne({
        where: { estate_id: estateId },
        order: [['created_at', 'DESC']],
      });

      if (!subscription) {
        // No subscription = no features
        return {
          statusCode: 200,
          status: 'success',
          data: {
            subscription_state: 'LAPSED',
            features: getFeatureFlags('LAPSED'),
          },
        };
      }

      const featureFlags = getFeatureFlags(
        subscription.subscription_state,
        subscription.lapsed_start_date
      );

      return {
        statusCode: 200,
        status: 'success',
        data: {
          subscription_state: subscription.subscription_state,
          features: featureFlags,
        },
      };
    } catch (error: any) {
      return {
        statusCode: 500,
        status: 'error',
        message: error.message,
      };
    }
  }

  // Delete (soft-delete) subscription for estate — admin only
  async deleteSubscription(estateId: string) {
    const subscription = await Subscription.findOne({
      where: { estate_id: estateId },
      order: [['created_at', 'DESC']],
    });

    if (!subscription) {
      return { statusCode: 404, status: 'error', message: 'No subscription found for this estate' };
    }

    await subscription.destroy();

    return { statusCode: 200, status: 'success', message: 'Subscription deleted' };
  }

  // Update resident count
  async updateResidentCount(estateId: string): Promise<void> {
    const subscription = await Subscription.findOne({
      where: { estate_id: estateId },
      order: [['created_at', 'DESC']],
    });

    if (subscription) {
      const count = await User.count({
        where: { estate_id: estateId, user_type: 'resident' },
      });

      await subscription.update({ resident_count: count });
    }
  }
}

export default new EnhancedSubscriptionService();
