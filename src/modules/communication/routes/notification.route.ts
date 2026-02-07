import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const router = Router();

// Test endpoints
router.post('/test/email', authenticateToken, notificationController.sendTestEmail);
router.post('/test/sms', authenticateToken, notificationController.sendTestSMS);
router.get('/test/email-connection', authenticateToken, notificationController.testEmailConnection);

// Queue management
router.get('/queue/stats', authenticateToken, notificationController.getQueueStats);
router.post('/bulk', authenticateToken, notificationController.sendBulkNotification);

export default router;