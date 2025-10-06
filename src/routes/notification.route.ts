import { Router } from 'express';
import notificationController from '../controllers/notification.controller';
import { authenticateJWT } from '../middlewares/authentication';

const router = Router();

router.post('/subscribe', 
  authenticateJWT,
  notificationController.subscribe
);

router.get('/', 
  authenticateJWT,
  notificationController.getNotifications
);

router.put('/:notificationId/read', 
  authenticateJWT,
  notificationController.markAsRead
);

router.put('/read-all', 
  authenticateJWT,
  notificationController.markAllAsRead
);

router.post('/test', 
  authenticateJWT,
  notificationController.sendTestNotification
);

export default router;