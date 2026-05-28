import { Router } from 'express';
import { passwordResetController } from '../controllers/password-reset.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// CSRF Protection: /request endpoint is public (no auth required)
// /reset endpoint uses JWT token from email link in Authorization header (not cookies)
// JWT tokens in custom headers inherently protect against CSRF attacks
router.post('/request', passwordResetController.requestReset);
router.post('/reset', passwordResetController.resetPassword);
router.post('/change', authenticateToken, passwordResetController.changePassword);

export default router;