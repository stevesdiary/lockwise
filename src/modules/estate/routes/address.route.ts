import { Router } from 'express';
import addressController from '../controllers/address.controller';
import { authenticateToken } from '../../../shared/middleware/auth.middleware';

const router = Router();

// Streets
router.get('/estates/:estate_id/streets', authenticateToken, addressController.getStreets);
router.post('/estates/:estate_id/streets', authenticateToken, addressController.createStreet);

// Units — search across all streets of an estate (supports ?search= and ?street_id=)
router.get('/estates/:estate_id/units', authenticateToken, addressController.searchUnits);

// Units — all units for a specific street
router.get('/streets/:street_id/units', authenticateToken, addressController.getUnits);
router.post('/streets/:street_id/units', authenticateToken, addressController.createUnit);

// Full address for a unit
router.get('/units/:unit_id/address', authenticateToken, addressController.getFullAddress);

export default router;
