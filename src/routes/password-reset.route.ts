import { Router } from 'express';
import { passwordResetController } from '../controllers/password-reset.controller';

const router = Router();

router.post('/request', passwordResetController.requestReset);
router.post('/reset', passwordResetController.resetPassword);

export default router;