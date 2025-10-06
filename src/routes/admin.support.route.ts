import { Router } from 'express';
import adminSupportController from '../controllers/admin.support.controller';
import { authenticateJWT } from '../middlewares/authentication';
import authorizeRoles from '../middlewares/authorizeRoles';

const router = Router();

router.get('/tickets', 
  authenticateJWT,
  authorizeRoles(['admin', 'manager']),
  adminSupportController.getAllTickets
);

router.put('/tickets/:ticketId/assign', 
  authenticateJWT,
  authorizeRoles(['admin', 'manager']),
  adminSupportController.assignTicket
);

router.put('/tickets/:ticketId/status', 
  authenticateJWT,
  authorizeRoles(['admin', 'manager']),
  adminSupportController.updateTicketStatus
);

router.post('/tickets/:ticketId/messages', 
  authenticateJWT,
  authorizeRoles(['admin', 'manager']),
  adminSupportController.addAdminMessage
);

router.get('/stats', 
  authenticateJWT,
  authorizeRoles(['admin', 'manager']),
  adminSupportController.getTicketStats
);

router.get('/search', 
  authenticateJWT,
  authorizeRoles(['admin', 'manager']),
  adminSupportController.searchTickets
);

export default router;