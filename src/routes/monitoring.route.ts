import { Router } from 'express';
import { monitoringController } from '../controllers/monitoring.controller';
import { authenticateJWT } from '../middlewares/authentication';

const router = Router();

router.get('/health', monitoringController.getHealth);
router.get('/metrics', authenticateJWT, monitoringController.getMetrics);
router.post('/metrics/reset', authenticateJWT, monitoringController.resetMetrics);

export default router;