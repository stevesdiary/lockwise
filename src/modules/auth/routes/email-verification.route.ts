import { Router } from 'express';
import { emailVerificationController } from '../controllers/email-verification.controller';

const router = Router();

// CSRF Protection: POST routes are public endpoints with email/code validation
router.post('/send-code', emailVerificationController.sendCode);
router.post('/verify-code', emailVerificationController.verifyCode);

export default router;
