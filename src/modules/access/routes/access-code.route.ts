import { Router } from 'express';
import { authenticateToken, requireResident } from '../../auth/middleware/auth.middleware';
import { accessCodeController } from '../controllers/access-code.controller';

const router = Router();

router.post('/generate', authenticateToken, requireResident, accessCodeController.generateCode);
router.post('/validate', authenticateToken, accessCodeController.validateCode);
router.post('/approve', authenticateToken, accessCodeController.approveAccess);
router.post('/reject', authenticateToken, accessCodeController.rejectAccess);
router.get('/', authenticateToken, accessCodeController.getAccessCodes);

export default router;
