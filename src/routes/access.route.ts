import express from 'express';
import {
  createAccessRecord,
  recordEntry,
  recordExit,
  approveAccess,
  getAllAccess,
  getActiveAccess
} from '../controllers/access.controller';
import authentication from '../middlewares/authentication';
import authorizeRoles from '../middlewares/authorizeRoles';

const router = express.Router();

// Access management routes
router.post('/', authentication, createAccessRecord);
router.get('/all', authentication, getAllAccess);
router.get('/active', authentication, getActiveAccess);

// Access approval and logging
router.put('/:accessId/approve', authentication, authorizeRoles(['admin', 'security']), approveAccess);
router.post('/:accessId/entry', authentication, recordEntry);
router.post('/:accessId/exit', authentication, recordExit);

export default router;