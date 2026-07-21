import { Router } from 'express';
import newsletterController from '../controllers/newsletter.controller';
import { authenticateToken, requireAdmin } from '../../../shared/middleware/auth.middleware';

const router = Router();

// Public routes (no auth)
router.post('/subscribe', newsletterController.subscribe);
router.post('/unsubscribe', newsletterController.unsubscribe);

// Admin routes
router.get('/subscribers', authenticateToken, requireAdmin, newsletterController.getSubscribers);
router.get('/stats', authenticateToken, requireAdmin, newsletterController.getStats);

export default router;
