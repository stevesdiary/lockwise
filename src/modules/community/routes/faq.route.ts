import { Router } from 'express';
import faqController from '../controllers/faq.controller';
import { authenticateToken } from '../../../shared/middleware/auth.middleware';
import { authorizeRoles } from '../../../shared/middleware/permission.middleware';

const router = Router();

// Public routes
router.get('/', faqController.getFaqs);

// Admin routes
router.post('/', 
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  faqController.createFaq
);

router.put('/:id', 
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  faqController.updateFaq
);

router.delete('/:id', 
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  faqController.deleteFaq
);

router.get('/admin', 
  authenticateToken,
  authorizeRoles(['admin', 'manager']),
  faqController.getAdminFaqs
);

export default router;