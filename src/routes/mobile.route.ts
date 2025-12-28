import { Router } from 'express';
import { mobileController } from '../controllers/mobile.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { rateLimiters } from '../middleware/rate-limit.middleware';

const router = Router();

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