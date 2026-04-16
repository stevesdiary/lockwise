import { Router } from 'express';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import { deviceController } from '../controllers/device.controller';
import { AuthRequest } from '../../auth/middleware/auth.middleware';
import { pushNotificationService } from '../../communication/services/push-notification.service';

const router = Router();

router.use(authenticateToken);

router.post('/device/register', deviceController.registerDevice);
router.delete('/device/register', deviceController.unregisterDevice);
router.post('/push/test', async (req: AuthRequest, res) => {
  try {
    const { title = 'Test Notification', body = 'This is a test push notification from Lockwise', data } = req.body;
    await pushNotificationService.sendToUser(req.user!.id, title, body, { type: 'system_alert', ...data });
    res.json({ success: true, message: 'Test push notification sent' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
