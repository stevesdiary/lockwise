import { Router } from 'express';
import { authenticateToken } from '../../../shared/middleware/auth.middleware';
import { twoFactorController } from '../controllers/two-factor.controller';

const router = Router();

// Authenticated routes — user must be logged in
router.post('/setup', authenticateToken as any, twoFactorController.setup);
router.post('/verify-setup', authenticateToken as any, twoFactorController.verifySetup);
router.post('/disable', authenticateToken as any, twoFactorController.disable);
router.post('/backup-codes', authenticateToken as any, twoFactorController.regenerateBackupCodes);
router.post('/recovery/send-code', authenticateToken as any, twoFactorController.sendRecoveryCode);
router.post('/reactivate', authenticateToken as any, twoFactorController.reactivate);

// Public route — called during login flow with 2fa_token
router.post('/validate', twoFactorController.validate);

export default router;
