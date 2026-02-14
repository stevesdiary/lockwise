import { Router } from 'express';
import { evChargingController } from '../controllers/ev-charging.controller';
import { authenticateToken, requireRole } from '../../auth/middleware/auth.middleware';
import { rateLimiters } from '../../admin/middleware/rate-limit.middleware';
import { UserRole } from '../../auth/types/user.types';

const router = Router();

// Resident routes
router.get(
  '/estate/:estateId/slots',
  rateLimiters.api,
  authenticateToken,
  evChargingController.getChargingSlots
);

router.post(
  '/sessions/start',
  rateLimiters.api,
  authenticateToken,
  evChargingController.startSession
);

router.post(
  '/sessions/:sessionId/stop',
  rateLimiters.api,
  authenticateToken,
  evChargingController.stopSession
);

router.get(
  '/sessions/my',
  rateLimiters.api,
  authenticateToken,
  evChargingController.getMySessions
);

router.get(
  '/sessions/active',
  rateLimiters.api,
  authenticateToken,
  evChargingController.getActiveSession
);

export default router;
