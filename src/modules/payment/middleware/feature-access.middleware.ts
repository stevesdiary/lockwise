import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import { Subscription } from '../models/subscription.model';
import { FeatureName, getFeatureFlags } from '../types/feature-flags.types';

export function checkFeatureAccess(featureName: FeatureName) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const estateId = req.user?.estate_id;

      if (!estateId) {
        return res.status(401).json({
          statusCode: 401,
          status: 'error',
          message: 'Authentication required',
        });
      }

      const subscription = await Subscription.findOne({
        where: {
          estate_id: estateId,
          subscription_state: ['TRIAL', 'ACTIVE', 'GRACE', 'LAPSED'],
        },
        order: [['created_at', 'DESC']],
      });

      // No subscription — allow access (all features unlocked for now)
      if (!subscription) {
        return next();
      }

      // Free trial expiry gate — block if trial has lapsed
      if (subscription.subscription_state === 'LAPSED') {
        return res.status(403).json({
          statusCode: 403,
          status: 'error',
          message: 'Your free trial has expired. Please subscribe to continue using Lockwise.',
          feature: featureName,
          subscription_state: subscription.subscription_state,
          upgrade_required: true,
        });
      }

      // --- Plan-level feature checks disabled: all plans get same features ---
      // const featureFlags = getFeatureFlags(
      //   subscription.subscription_state,
      //   subscription.lapsed_start_date
      // );
      //
      // if (!featureFlags[featureName]) {
      //   const stateMessages: Record<string, string> = {
      //     GRACE: 'This feature is temporarily unavailable during the grace period. Please renew your subscription to restore access.',
      //     LAPSED: 'This feature is unavailable. Please renew your subscription to continue using Lockwise.',
      //   };
      //
      //   return res.status(403).json({
      //     statusCode: 403,
      //     status: 'error',
      //     message: stateMessages[subscription.subscription_state] || 'This feature is not available on your current plan',
      //     feature: featureName,
      //     subscription_state: subscription.subscription_state,
      //     upgrade_required: true,
      //     restricted_features: Object.keys(featureFlags).filter(
      //       (key) => !featureFlags[key as FeatureName]
      //     ),
      //   });
      // }

      next();
    } catch (error: any) {
      console.error('Feature access check error:', error);
      return res.status(500).json({
        statusCode: 500,
        status: 'error',
        message: 'Failed to verify feature access',
      });
    }
  };
}

// Middleware to check if manager portal is read-only (days 22-30 of lapsed state)
export async function checkManagerWriteAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // --- Manager write restrictions disabled for now ---
  // try {
  //   const estateId = req.user?.estate_id;
  //   const userRole = req.user?.role;
  //
  //   if (!userRole || !['MANAGER', 'ADMIN', 'SUPER_ADMIN', 'MASTER'].includes(userRole)) {
  //     return next();
  //   }
  //
  //   if (!estateId) {
  //     return res.status(401).json({
  //       statusCode: 401,
  //       status: 'error',
  //       message: 'Authentication required',
  //     });
  //   }
  //
  //   const subscription = await Subscription.findOne({
  //     where: {
  //       estate_id: estateId,
  //       subscription_state: 'LAPSED',
  //     },
  //     order: [['created_at', 'DESC']],
  //   });
  //
  //   if (subscription && subscription.lapsed_start_date) {
  //     const now = new Date();
  //     const diffMs = now.getTime() - subscription.lapsed_start_date.getTime();
  //     const daysSinceLapsed = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  //
  //     if (daysSinceLapsed >= 22 && daysSinceLapsed <= 30) {
  //       if (req.method === 'GET') {
  //         return next();
  //       }
  //       return res.status(403).json({
  //         statusCode: 403,
  //         status: 'error',
  //         message: 'Manager portal is currently in read-only mode. Please renew your subscription to restore full access.',
  //         read_only_mode: true,
  //         days_since_lapsed: daysSinceLapsed,
  //       });
  //     }
  //
  //     if (daysSinceLapsed > 30) {
  //       return res.status(403).json({
  //         statusCode: 403,
  //         status: 'error',
  //         message: 'Manager portal access has been suspended. Please renew your subscription immediately.',
  //         portal_locked: true,
  //         days_since_lapsed: daysSinceLapsed,
  //       });
  //     }
  //   }
  //
  //   next();
  // } catch (error: any) {
  //   console.error('Manager write access check error:', error);
  //   next();
  // }

  next();
}
