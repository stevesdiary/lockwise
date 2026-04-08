import { Router } from 'express';
import { ReferralController } from '../controllers/referral.controller';
import { asyncHandler } from '../../../shared/middleware/error-handler.middleware';
import { authenticateToken, requireAdmin } from '../../auth/middleware/auth.middleware';
import { authenticateReferrer } from '../middleware/referrer-auth.middleware';
import { rateLimiters } from '../../admin/middleware/rate-limit.middleware';

const referralRouter = Router();

// Public portal endpoints
referralRouter.post('/apply', rateLimiters.auth, asyncHandler(ReferralController.applyAsReferrer));
referralRouter.post('/login', rateLimiters.auth, asyncHandler(ReferralController.loginReferrer));
referralRouter.get('/me', rateLimiters.api, authenticateReferrer as any, asyncHandler(ReferralController.getPortalSummary));

// Admin-only management endpoints (must be before /:code wildcard)
referralRouter.post('/register', rateLimiters.api, authenticateToken, requireAdmin, asyncHandler(ReferralController.registerReferrer));
referralRouter.get('/', rateLimiters.api, authenticateToken, requireAdmin, asyncHandler(ReferralController.listReferrers));
referralRouter.delete('/delete/:id', rateLimiters.api, authenticateToken, requireAdmin, asyncHandler(ReferralController.deleteReferrer));

// Bonus management endpoints (Admin only)
referralRouter.get(
  '/bonuses/unpaid',
  rateLimiters.api,
  authenticateToken,
  requireAdmin,
  asyncHandler(ReferralController.getUnpaidBonuses)
);

referralRouter.get(
  '/referrer/:referrerId/bonuses',
  rateLimiters.api,
  authenticateToken,
  asyncHandler(ReferralController.getReferrerBonuses)
);

referralRouter.post(
  '/bonuses/:bonusId/pay',
  rateLimiters.strict,
  authenticateToken,
  requireAdmin,
  asyncHandler(ReferralController.markBonusAsPaid)
);

// Wildcard param — must be last to avoid shadowing literal routes above
referralRouter.get('/:code', rateLimiters.api, authenticateToken, requireAdmin, asyncHandler(ReferralController.getReferrer));

export default referralRouter;
