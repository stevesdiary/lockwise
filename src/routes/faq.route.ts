import { Router } from 'express';
import faqController from '../controllers/faq.controller';
import { authenticateJWT } from '../middlewares/authentication';
import authorizeRoles from '../middlewares/authorizeRoles';

const router = Router();

// Public routes
router.get('/', faqController.getFaqs);

// Admin routes
router.post('/', 
  authenticateJWT,
  authorizeRoles(['admin', 'manager']),
  faqController.createFaq
);

router.put('/:id', 
  authenticateJWT,
  authorizeRoles(['admin', 'manager']),
  faqController.updateFaq
);

router.delete('/:id', 
  authenticateJWT,
  authorizeRoles(['admin', 'manager']),
  faqController.deleteFaq
);

router.get('/admin', 
  authenticateJWT,
  authorizeRoles(['admin', 'manager']),
  faqController.getAdminFaqs
);

export default router;