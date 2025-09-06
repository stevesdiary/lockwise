import express from 'express';
import {
  createAccessRecord,
  recordEntry,
  recordExit,
  getAccessWithEntries,
  getActiveEntries,
  checkEntryPermission,
  checkInVisitor,
  checkOutVisitor,
  getAllAccess,
  getOneAccess
} from '../controllers/access.controller';
import authentication from '../middlewares/authentication';
import { authorizeRole } from '../middlewares/authorizeRoles';

const router = express.Router();

// Access management routes
router.post('/', authentication, createAccessRecord);
router.get('/', authentication, getAllAccess);
router.get('/:id', authentication, getOneAccess);

// Multiple entry routes
router.post('/:accessId/entries', authentication, recordEntry);
router.put('/entries/:entryId/exit', authentication, recordExit);
router.get('/:accessId/entries', authentication, getAccessWithEntries);
router.get('/:accessId/entries/active', authentication, getActiveEntries);
router.get('/:accessId/can-enter', authentication, checkEntryPermission);

// Legacy routes (for backward compatibility)
router.post('/check-in', authentication, checkInVisitor);
router.post('/check-out', authentication, checkOutVisitor);

// Admin routes (require admin role)
router.get('/admin/all', authentication, authorizeRole('admin', 'security'), getAllAccess);

export default router;