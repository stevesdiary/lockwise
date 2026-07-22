import { Router } from 'express';
import subscriptionController from '../controllers/subscription.controller';
import { authenticateToken, requireAdmin } from '../../../shared/middleware/auth.middleware';

const router = Router();

// Get available plans (public)
router.get('/plans', subscriptionController.getAvailablePlans);

// Select plan for estate (authenticated)
router.post(
  '/estates/:estateId/subscription/select-plan',
  authenticateToken,
  subscriptionController.selectPlan
);

// Get subscription status for estate
router.get(
  '/estates/:estateId/subscription/status',
  authenticateToken,
  subscriptionController.getSubscriptionStatus
);

// Get feature flags for estate
router.get(
  '/estates/:estateId/features',
  authenticateToken,
  subscriptionController.getFeatures
);

// Upgrade plan for estate
router.post(
  '/estates/:estateId/subscription/upgrade',
  authenticateToken,
  subscriptionController.upgradePlan
);

// Delete subscription for estate (admin only)
router.delete(
  '/estates/:estateId/subscription',
  authenticateToken,
  requireAdmin,
  subscriptionController.deleteSubscription
);

export default router;
