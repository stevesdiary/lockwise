import { Router } from 'express';
import emergencyController from '../controllers/emergency.controller';
import { authenticateToken } from '../../../shared/middleware/auth.middleware';
import { requireAdmin } from '../../../shared/middleware/auth.middleware';

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

// Location-based emergency contacts (authenticated)
router.get('/location-contacts', authenticateToken, emergencyController.getLocationContacts);
router.get('/location-contacts/countries', authenticateToken, emergencyController.getCountries);
router.get('/location-contacts/countries/:countryId/states', authenticateToken, emergencyController.getStates);
router.get('/location-contacts/states/:stateId/cities', authenticateToken, emergencyController.getCities);
router.get('/location-contacts/categories', authenticateToken, emergencyController.getCategories);

// Admin CRUD
router.get('/location-contacts/admin', authenticateToken, requireAdmin, emergencyController.adminListContacts);
router.post('/location-contacts/admin', authenticateToken, requireAdmin, emergencyController.adminCreateContact);
router.put('/location-contacts/admin/:contactId', authenticateToken, requireAdmin, emergencyController.adminUpdateContact);
router.delete('/location-contacts/admin/:contactId', authenticateToken, requireAdmin, emergencyController.adminDeleteContact);

export default router;