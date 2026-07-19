import { Router } from 'express';
import adminSupportController from '../controllers/admin.support.controller';
import { authenticateToken } from '../../../shared/middleware/auth.middleware';
import { authorizeRoles } from '../../../shared/middleware/permission.middleware';

const router = Router();

router.get('/tickets', 
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  adminSupportController.getAllTickets
);

router.put('/tickets/:ticketId/assign', 
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  adminSupportController.assignTicket
);

router.put('/tickets/:ticketId/status', 
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  adminSupportController.updateTicketStatus
);

router.post('/tickets/:ticketId/messages', 
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  adminSupportController.addAdminMessage
);

router.get('/stats', 
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  adminSupportController.getTicketStats
);

router.get('/search', 
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  adminSupportController.searchTickets
);

export default router;