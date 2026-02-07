import { Router } from 'express';
import { apiKeyController } from '../controllers/api-key.controller';
import { authenticateToken, requireAdmin } from '../../auth/middleware/auth.middleware';
import { rateLimiters } from '../../admin/middleware/rate-limit.middleware';
import { auditLogger } from '../../admin/middleware/audit.middleware';

const router = Router();

router.post('/generate', 
  rateLimiters.strict,
  authenticateToken, 
  requireAdmin,
  auditLogger,
  apiKeyController.generateKey
);

router.get('/list', 
  rateLimiters.api,
  authenticateToken, 
  requireAdmin,
  apiKeyController.listKeys
);

router.delete('/:keyId', 
  rateLimiters.api,
  authenticateToken, 
  requireAdmin,
  auditLogger,
  apiKeyController.revokeKey
);

export default router;