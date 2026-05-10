import { Request as ExpressRequest, Response } from 'express';
import * as yup from 'yup';

import { 
  paymentInitiationSchema, 
  paymentVerificationSchema 
} from '../../../shared/utils/validator';
import { paymentService } from '../../payment/services/payment.service';
import realTimeNotificationService from '../../communication/services/realtime-notification.service';
import { asString } from '../../../shared/utils/param.util';
import subscriptionService from '../services/subscription.service';
import { Subscription } from '../models/subscription.model';
import { UserRole } from '../../../shared/constants/permissions';

const subscriptionInitiationSchema = yup.object().shape({
  plan_id: yup.string().required('Plan ID is required'),
  paymentMethod: yup.string().trim().optional().default('card')
});

const isGlobalPaymentReader = (role?: string) =>
  role === UserRole.MASTER || role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN;

const isEstateScopedReader = (role?: string) => role === UserRole.MANAGER;

const paymentController = {
  initiatePayment: async (req: ExpressRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const transactionData = await paymentInitiationSchema.validate(req.body, { 
        abortEarly: false 
      });

      const userEmail = req.user.email || transactionData.email;
      if (!userEmail) {
        return res.status(400).json({
          status: 'error',
          message: 'User email is required to initiate payment'
        });
      }

      const paymentData = {
        amount: transactionData.amount,
        email: userEmail,
        currency: transactionData.currency || 'NGN',
        payment_provider: 'paystack' as const,
        payment_method: transactionData.paymentMethod,
        user_id: req.user.id,
        estate_id: req.user.estate_id,
      };
      const paymentResult = await paymentService.initiatePayment(paymentData);
      if (!paymentResult) {
        console.error('Failed to initiate');
        return res.status(500).json({
          status: 'error',
          message: 'Failed to initiate payment'
        });
      }
      
      // Send real-time notification
      await realTimeNotificationService.sendNotification(
        req.user.id,
        `Payment of ${paymentData.amount} ${paymentData.currency} initiated` // message
      );
      
      return res.status(paymentResult.statusCode).json(paymentResult);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors = error.inner.map(err => ({
          field: err.path || 'unknown',
          message: err.message,
          type: err.type
        }));
        
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors
        });
      }
      
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  verifyPayment: async (req: ExpressRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const validatedData = await paymentVerificationSchema.validate(req.params, { 
        abortEarly: false 
      });
      
      const verificationResult = await paymentService.verifyPayment(validatedData);
      
      return res.status(verificationResult.statusCode).json(verificationResult);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.errors.map(errorMsg => ({
            message: errorMsg
          }))
        });
      }
      
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getAllPayments: async (req: ExpressRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const { page = 1, limit = 50, status } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      const scope: { user_id?: string; estate_id?: string } = {};

      if (!isGlobalPaymentReader(req.user.role)) {
        if (isEstateScopedReader(req.user.role)) {
          if (req.user.estate_id) {
            scope.estate_id = req.user.estate_id;
          } else {
            scope.user_id = req.user.id;
          }
        } else {
          scope.user_id = req.user.id;
        }
      }
      
      const payments = await paymentService.getAllPayments({
        limit: Number(limit),
        offset,
        status: status as string,
        ...scope,
      });

      return res.status(payments.statusCode).json(payments);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getPaymentById: async (req: ExpressRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const paymentId = asString(req.params.paymentId);
      const scope: { user_id?: string; estate_id?: string } = {};
      if (!isGlobalPaymentReader(req.user.role)) {
        if (isEstateScopedReader(req.user.role)) {
          scope.estate_id = req.user.estate_id;
        } else {
          scope.user_id = req.user.id;
        }
      }

      const payment = await paymentService.getPaymentById(paymentId, scope);
      return res.status(payment.statusCode).json(payment);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getPaymentByReference: async (req: ExpressRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const reference = asString(req.params.reference);
      const scope: { user_id?: string; estate_id?: string } = {};
      if (!isGlobalPaymentReader(req.user.role)) {
        if (isEstateScopedReader(req.user.role)) {
          scope.estate_id = req.user.estate_id;
        } else {
          scope.user_id = req.user.id;
        }
      }

      const payment = await paymentService.getPaymentByReference(reference, scope);
      return res.status(payment.statusCode).json(payment);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  paymentCallback: async (req: ExpressRequest, res: Response) => {
    try {
      const rawReference = req.query.reference || req.query.trxref || req.query.tx_ref;
      let reference = '';
      if (typeof rawReference === 'string') {
        reference = rawReference;
      } else if (Array.isArray(rawReference)) {
        const firstString = rawReference.find((item): item is string => typeof item === 'string');
        reference = firstString || '';
      }
      if (!reference) {
        return res.status(400).json({
          status: 'error',
          message: 'Missing payment reference in callback'
        });
      }

      const verificationResult = await paymentService.verifyPayment({ reference });
      return res.status(verificationResult.statusCode).json({
        status: verificationResult.status,
        message: verificationResult.message,
        data: {
          reference,
          ...verificationResult.data,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to process payment callback',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  initiateSubscription: async (req: ExpressRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      if (!req.user.estate_id) {
        return res.status(400).json({
          status: 'error',
          message: 'User is not linked to an estate'
        });
      }

      const data = await subscriptionInitiationSchema.validate(req.body, { abortEarly: false });
      const result = await subscriptionService.createSubscription({
        estate_id: req.user.estate_id,
        plan_id: data.plan_id,
        payment_method: data.paymentMethod,
        user_id: req.user.id,
        user_email: req.user.email,
      });

      return res.status(result.statusCode).json(result);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        return res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors: error.inner.map((err) => ({
            field: err.path || 'unknown',
            message: err.message
          }))
        });
      }

      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getCurrentSubscription: async (req: ExpressRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      if (!req.user.estate_id) {
        return res.status(400).json({
          status: 'error',
          message: 'User is not linked to an estate'
        });
      }

      const result = await subscriptionService.getCurrentSubscriptionForEstate(req.user.estate_id);
      return res.status(result.statusCode).json(result);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  getSubscriptionStatus: async (req: ExpressRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Authentication required' });
      }

      if (!req.user.estate_id) {
        return res.status(400).json({ status: 'error', message: 'User is not linked to an estate' });
      }

      const result = await subscriptionService.getCurrentSubscriptionForEstate(req.user.estate_id);
      if (result.statusCode !== 200 || !result.data) {
        return res.status(result.statusCode).json(result);
      }

      const sub = result.data as any;
      const now = new Date();
      const paymentUrl = `${process.env.WEB_PORTAL_URL}/subscribe`;

      let showBanner = false;
      let bannerType: 'warning' | 'urgent' | 'critical' | null = null;
      let bannerMessage = '';
      let daysRemaining: number | null = null;

      if (sub.status === 'active' && sub.end_date) {
        const days = Math.ceil((new Date(sub.end_date).getTime() - now.getTime()) / 86400000);
        if (days <= 7) {
          showBanner = true;
          bannerType = 'warning';
          daysRemaining = days;
          bannerMessage = `Your subscription expires in ${days} day${days !== 1 ? 's' : ''}. Renew to avoid interruption.`;
        }
      } else if (sub.status === 'grace_period' && sub.grace_period_end_date) {
        const days = Math.ceil((new Date(sub.grace_period_end_date).getTime() - now.getTime()) / 86400000);
        showBanner = true;
        bannerType = 'urgent';
        daysRemaining = Math.max(0, days);
        bannerMessage = `Grace period active — ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left. Renew now to avoid service interruption.`;
      } else if (sub.status === 'expired') {
        showBanner = true;
        bannerType = 'critical';
        bannerMessage = 'Your subscription has expired. Renew now to continue using Lockwise.';
      }

      return res.status(200).json({
        status: 'success',
        data: {
          subscription: sub,
          show_banner: showBanner,
          banner_type: bannerType,
          banner_message: bannerMessage,
          days_remaining: daysRemaining,
          payment_url: paymentUrl,
        },
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  cancelSubscription: async (req: ExpressRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      const subscriptionId = asString(req.params.subscriptionId);
      if (!subscriptionId) {
        return res.status(400).json({
          status: 'error',
          message: 'subscriptionId is required'
        });
      }

      const result = await subscriptionService.cancelSubscription(subscriptionId, req.user.estate_id || '');
      return res.status(result.statusCode).json(result);
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to cancel subscription',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  toggleWalletPayment: async (req: ExpressRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ status: 'error', message: 'Authentication required' });
      }

      const subscriptionId = asString(req.params.subscriptionId);
      const enabled = req.body?.enabled === true;

      const subscription = await Subscription.findOne({
        where: { id: subscriptionId, estate_id: req.user.estate_id || '' },
      });
      if (!subscription) {
        return res.status(404).json({ status: 'error', message: 'Subscription not found' });
      }

      await subscription.update({ wallet_payment_enabled: enabled });
      return res.json({ status: 'success', data: { wallet_payment_enabled: enabled } });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update wallet payment setting',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Admin endpoint to manually trigger subscription expiry check
  checkExpiredSubscriptions: async (req: ExpressRequest, res: Response) => {
    try {
      const count = await subscriptionService.checkExpiredSubscriptions();
      return res.json({
        status: 'success',
        message: `Processed ${count} expired subscription(s)`,
        data: { count }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to check expired subscriptions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

};

export default paymentController;
