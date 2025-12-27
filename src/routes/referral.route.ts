import { Router } from 'express';
import { ReferralController } from '../controllers/referral.controller';
import { asyncHandler } from '../middlewares/error-handler.middleware';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { rateLimiters } from '../middleware/rate-limit.middleware';

const referralRouter = Router();

referralRouter.post('/register', asyncHandler(ReferralController.registerReferrer));
referralRouter.get('/:code', asyncHandler(ReferralController.getReferrer));
referralRouter.get('/', asyncHandler(ReferralController.listReferrers));
referralRouter.delete('/delete/:id', asyncHandler(ReferralController.deleteReferrer));

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

export default referralRouter;