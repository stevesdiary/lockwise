import { Router } from 'express';
import demoRequestController from '../controllers/demo-request.controller';
import { authenticateToken, requireAdmin } from '../../../shared/middleware/auth.middleware';

const router = Router();

// Public routes (no auth)
router.post('/', demoRequestController.createRequest);

// Admin routes
router.get('/', authenticateToken, requireAdmin, demoRequestController.getRequests);
router.get('/stats', authenticateToken, requireAdmin, demoRequestController.getStats);
router.get('/:id', authenticateToken, requireAdmin, demoRequestController.getRequest);
router.patch('/:id', authenticateToken, requireAdmin, demoRequestController.updateRequest);

export default router;
