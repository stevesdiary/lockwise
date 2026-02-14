import { Router } from 'express';
import { mobileController } from '../controllers/mobile.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import { rateLimiters } from '../../admin/middleware/rate-limit.middleware';

const router = Router();

// CSRF Protection: All POST routes use JWT tokens in Authorization header (not cookies)
// which inherently protects against CSRF attacks as browsers don't auto-send custom headers

router.post('/device/register', 
  rateLimiters.api,
  authenticateToken,
  mobileController.registerDevice
);

router.get('/sync', 
  rateLimiters.api,
  authenticateToken,
  mobileController.syncData
);

router.post('/sync/upload', 
  rateLimiters.api,
  authenticateToken,
  mobileController.uploadPendingChanges
);

router.post('/deep-link', 
  rateLimiters.api,
  authenticateToken,
  mobileController.generateDeepLink
);

router.post('/push/test', 
  rateLimiters.strict,
  authenticateToken,
  mobileController.testPushNotification
);

export default router;