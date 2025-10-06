import { Router } from 'express';
import emergencyController from '../controllers/emergency.controller';
import { authenticateJWT } from '../middlewares/authentication';

const router = Router();

// Emergency alerts
router.post('/alerts', 
  authenticateJWT,
  emergencyController.createAlert
);

router.get('/alerts', 
  authenticateJWT,
  emergencyController.getAlerts
);

router.put('/alerts/:alertId/resolve', 
  authenticateJWT,
  emergencyController.resolveAlert
);

// Emergency contacts
router.get('/contacts', 
  authenticateJWT,
  emergencyController.getEmergencyContacts
);

router.post('/contacts', 
  authenticateJWT,
  emergencyController.createEmergencyContact
);

router.post('/contacts/setup-defaults', 
  authenticateJWT,
  emergencyController.setupDefaultContacts
);

export default router;