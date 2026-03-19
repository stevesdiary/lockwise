import { Router } from 'express';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import { deviceController } from '../controllers/device.controller';

const router = Router();

router.use(authenticateToken);

router.post('/device/register', deviceController.registerDevice);
router.delete('/device/register', deviceController.unregisterDevice);
router.post('/push/test', async (req, res) => {
  res.json({ success: true, message: 'Test push notification sent (FCM not configured)' });
});

export default router;
