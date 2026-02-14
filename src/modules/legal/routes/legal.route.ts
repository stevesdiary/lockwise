import { Router } from 'express';
import { legalController } from '../controllers/legal.controller';

const router = Router();

router.get('/terms', legalController.getTermsAndConditions);
router.get('/privacy', legalController.getPrivacyPolicy);

export default router;