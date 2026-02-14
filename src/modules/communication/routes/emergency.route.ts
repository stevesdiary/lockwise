import { Router } from 'express';
import emergencyController from '../controllers/emergency.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const router = Router();

// Emergency alerts
router.post('/alerts', 
  authenticateToken,
  emergencyController.createAlert
);

router.get('/alerts', 
  authenticateToken,
  emergencyController.getAlerts
);

router.put('/alerts/:alertId/resolve', 
  authenticateToken,
  emergencyController.resolveAlert
);

// Emergency contacts
router.get('/contacts', 
  authenticateToken,
  emergencyController.getEmergencyContacts
);

router.post('/contacts', 
  authenticateToken,
  emergencyController.createEmergencyContact
);

router.post('/contacts/setup-defaults', 
  authenticateToken,
  emergencyController.setupDefaultContacts
);

export default router;