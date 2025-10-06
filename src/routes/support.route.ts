import { Router } from 'express';
import supportController from '../controllers/support.controller';
import { authenticateJWT } from '../middlewares/authentication';

const router = Router();

router.post('/tickets', 
  authenticateJWT,
  supportController.createTicket
);

router.get('/tickets', 
  authenticateJWT,
  supportController.getUserTickets
);

router.get('/tickets/:ticketId/messages', 
  authenticateJWT,
  supportController.getTicketMessages
);

router.post('/tickets/:ticketId/messages', 
  authenticateJWT,
  supportController.addMessage
);

export default router;