import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const router = Router();

// User notification endpoints
router.get('/', authenticateToken, notificationController.getUserNotifications);
router.patch('/:id', authenticateToken, notificationController.markAsRead);
router.patch('/mark-all-read', authenticateToken, notificationController.markAllAsRead);
router.delete('/clear-all', authenticateToken, notificationController.clearAll);

// Test endpoints
router.post('/test/sms', authenticateToken, notificationController.sendTestSMS);

// Queue management
router.get('/queue/stats', authenticateToken, notificationController.getQueueStats);
router.post('/bulk', authenticateToken, notificationController.sendBulkNotification);

export default router;