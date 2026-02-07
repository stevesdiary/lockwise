import { Router } from 'express';
import { supportController } from '../controllers/support.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import { requirePermission } from '../../auth/middleware/permission.middleware';
import { rateLimiters } from '../../admin/middleware/rate-limit.middleware';
import { Resource, Permission } from '../../../shared/constants/permissions';

const router = Router();

// Customer routes (residents, managers)
router.post(
  '/tickets',
  rateLimiters.api,
  authenticateToken,
  supportController.createTicket
);

router.get(
  '/tickets/my',
  rateLimiters.api,
  authenticateToken,
  supportController.getMyTickets
);

router.get(
  '/tickets/:ticketId/messages',
  rateLimiters.api,
  authenticateToken,
  supportController.getMessages
);

router.post(
  '/tickets/:ticketId/messages',
  rateLimiters.api,
  authenticateToken,
  supportController.sendMessage
);

// Agent routes (admin/manager only)
router.get(
  '/tickets/open',
  rateLimiters.api,
  authenticateToken,
  requirePermission(Resource.SUPPORT_TICKETS, Permission.UPDATE),
  supportController.getOpenTickets
);

router.get(
  '/tickets/assigned',
  rateLimiters.api,
  authenticateToken,
  requirePermission(Resource.SUPPORT_TICKETS, Permission.UPDATE),
  supportController.getAgentTickets
);

router.post(
  '/tickets/:ticketId/assign',
  rateLimiters.api,
  authenticateToken,
  requirePermission(Resource.SUPPORT_TICKETS, Permission.UPDATE),
  supportController.assignTicket
);

router.patch(
  '/tickets/:ticketId/status',
  rateLimiters.api,
  authenticateToken,
  requirePermission(Resource.SUPPORT_TICKETS, Permission.UPDATE),
  supportController.updateStatus
);

export default router;