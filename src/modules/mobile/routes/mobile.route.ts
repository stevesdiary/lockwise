import { Router } from 'express';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import { deviceController } from '../controllers/device.controller';

const router = Router();

router.use(authenticateToken);

router.post('/device/register', deviceController.registerDevice);
router.delete('/device/register', deviceController.unregisterDevice);

export default router;
