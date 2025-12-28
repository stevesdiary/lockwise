import { Router } from 'express';
import { supportController } from '../controllers/support.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';
import { rateLimiters } from '../middleware/rate-limit.middleware';

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

// Agent routes (customer service only)
router.get(
  '/tickets/open',
  rateLimiters.api,
  authenticateToken,
  requireRole('customer_service', 'admin'),
  supportController.getOpenTickets
);

router.get(
  '/tickets/assigned',
  rateLimiters.api,
  authenticateToken,
  requireRole('customer_service', 'admin'),
  supportController.getAgentTickets
);

router.post(
  '/tickets/:ticketId/assign',
  rateLimiters.api,
  authenticateToken,
  requireRole('customer_service', 'admin'),
  supportController.assignTicket
);

router.patch(
  '/tickets/:ticketId/status',
  rateLimiters.api,
  authenticateToken,
  requireRole('customer_service', 'admin'),
  supportController.updateStatus
);

export default router;