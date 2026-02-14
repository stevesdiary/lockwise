import { Router } from 'express';
import { adminDashboardController } from '../controllers/admin-dashboard.controller';
import { authenticateToken, requireAdmin } from '../../auth/middleware/auth.middleware';
import { rateLimiters } from '../../admin/middleware/rate-limit.middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Main dashboard
router.get(
  '/',
  rateLimiters.api,
  adminDashboardController.getDashboard
);

// Estate list
router.get(
  '/estates',
  rateLimiters.api,
  adminDashboardController.getEstates
);

// Statistics endpoints
router.get(
  '/stats/residents',
  rateLimiters.api,
  adminDashboardController.getResidentStats
);

router.get(
  '/stats/access-codes',
  rateLimiters.api,
  adminDashboardController.getAccessCodeStats
);

router.get(
  '/stats/referrers',
  rateLimiters.api,
  adminDashboardController.getReferrerStats
);

export default router;