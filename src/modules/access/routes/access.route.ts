import { Router } from 'express';
import { authenticateToken, requireManager } from '../../auth/middleware/auth.middleware';
import { 
  createAccessRecord, 
  processCodeScan,
  // getEntryStatistics,
  approveAccess, 
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
router.patch('/:accessId/approve', requireManager, approveAccess);

export default router;