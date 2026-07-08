import { Router } from 'express';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import { accessCodeController } from '../controllers/access-code.controller';

const router = Router();

// Public — guest visit-pass page (keyed by unguessable AccessLog UUID)
router.get('/nav/:token', accessCodeController.getGuestNav);

// Authenticated routes
router.use(authenticateToken);

router.get('/', accessCodeController.getAccessCodes);
router.post('/generate', accessCodeController.generateCode);
router.post('/validate', accessCodeController.validateCode);
router.post('/approve', accessCodeController.approveAccess);
router.post('/reject', accessCodeController.rejectAccess);
router.get('/:logId/share-url', accessCodeController.getShareUrl);
router.post('/:code/confirm', accessCodeController.confirmAccess);
router.post('/:code/revoke', accessCodeController.revokeCode);

export default router;
