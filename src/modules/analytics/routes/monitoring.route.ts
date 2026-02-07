import { Router } from 'express';
import { monitoringController } from '../controllers/monitoring.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const router = Router();

router.get('/health', monitoringController.getHealth);
router.get('/metrics', authenticateToken, monitoringController.getMetrics);
router.post('/metrics/reset', authenticateToken, monitoringController.resetMetrics);

export default router;