import { Router } from 'express';
import { phoneVerificationController } from '../controllers/phone-verification.controller';

const router = Router();

// CSRF Protection: POST routes use public endpoints with OTP validation
router.post('/send-otp', phoneVerificationController.sendOTP);
router.post('/verify-otp', phoneVerificationController.verifyOTP);

export default router;
