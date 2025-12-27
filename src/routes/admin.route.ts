import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { rateLimiters } from '../middleware/rate-limit.middleware';
import { auditLogger } from '../middleware/audit.middleware';

const router = Router();

// Admin registration (requires secret key)
router.post(
  '/register',
  rateLimiters.strict,
  auditLogger,
  adminController.registerAdmin
);

// Create customer service agent (admin only)
router.post(
  '/agents/create',
  rateLimiters.strict,
  authenticateToken,
  requireAdmin,
  auditLogger,
  adminController.createAgent
);

export default router;