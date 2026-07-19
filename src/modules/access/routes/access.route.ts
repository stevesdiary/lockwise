import { Router } from 'express';
import { authenticateToken, requireManager } from '../../../shared/middleware/auth.middleware';
import { requirePermission } from '../../../shared/middleware/permission.middleware';
import { Resource, Permission } from '../../../shared/constants/permissions';
import { 
  createAccessRecord, 
  processCodeScan,
  // getEntryStatistics,
  approveAccess,
  revokeAccess, 
  getAllAccess, 
  getActiveAccess 
} from '../controllers/access.controller';

const router = Router();

// CSRF Protection: POST/PATCH routes use JWT tokens in Authorization header (not cookies)
// which inherently protects against CSRF attacks as browsers don't auto-send custom headers
// /scan endpoint validates access codes cryptographically

// Public routes
router.post('/scan', processCodeScan); // Process code scan with entry validation

// Protected routes
router.use(authenticateToken);

// Access record management
router.post('/', createAccessRecord);
router.get('/', getAllAccess);
router.get('/active', getActiveAccess);
// router.get('/:accessId/statistics', getEntryStatistics);
router.patch('/:accessId/approve', requirePermission(Resource.ACCESS_CODES, Permission.APPROVE), approveAccess);
router.patch('/:accessId/revoke', revokeAccess);

export default router;