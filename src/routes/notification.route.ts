import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticateJWT } from '../middlewares/authentication';

const router = Router();

// Test endpoints
router.post('/test/email', authenticateJWT, notificationController.sendTestEmail);
router.post('/test/sms', authenticateJWT, notificationController.sendTestSMS);
router.get('/test/email-connection', authenticateJWT, notificationController.testEmailConnection);

// Queue management
router.get('/queue/stats', authenticateJWT, notificationController.getQueueStats);
router.post('/bulk', authenticateJWT, notificationController.sendBulkNotification);

export default router;