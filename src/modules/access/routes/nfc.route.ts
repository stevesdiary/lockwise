import { Router } from 'express';
import { nfcController } from '../controllers/nfc.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import { rateLimiters } from '../../admin/middleware/rate-limit.middleware';

const router = Router();

// Access validation endpoint (for NFC readers/gates)
router.post(
  '/validate',
  rateLimiters.api,
  nfcController.validateAccess
);

// Resident routes
router.get(
  '/my-card',
  rateLimiters.api,
  authenticateToken,
  nfcController.getMyCard
);

router.get(
  '/my-history',
  rateLimiters.api,
  authenticateToken,
  nfcController.getMyHistory
);

router.post(
  '/report-lost',
  rateLimiters.api,
  authenticateToken,
  nfcController.reportLost
);

export default router;
