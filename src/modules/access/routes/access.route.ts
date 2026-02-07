import express from 'express';
import {
  createAccessRecord,
  recordEntry,
  recordExit,
  approveAccess,
  getAllAccess,
  getActiveAccess
} from '../controllers/access.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import { authorizeRoles } from '../../auth/middleware/permission.middleware';

const router = express.Router();

// Access management routes
router.post('/', authenticateToken, createAccessRecord);
router.get('/all', authenticateToken, getAllAccess);
router.get('/active', authenticateToken, getActiveAccess);

// Access approval and logging
router.put('/:accessId/approve', authenticateToken, authorizeRoles(['admin', 'security']), approveAccess);
router.post('/:accessId/entry', authenticateToken, recordEntry);
router.post('/:accessId/exit', authenticateToken, recordExit);

export default router;