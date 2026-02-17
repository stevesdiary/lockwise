import { Router } from 'express';
import addressController from '../controllers/address.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const router = Router();

// Get streets for estate (with optional search)
router.get('/estates/:estate_id/streets', authenticateToken, addressController.getStreets);

// Get units for street
router.get('/streets/:street_id/units', authenticateToken, addressController.getUnits);

// Create street for estate
router.post('/estates/:estate_id/streets', authenticateToken, addressController.createStreet);

// Create unit for street
router.post('/streets/:street_id/units', authenticateToken, addressController.createUnit);

// Get full address for unit
router.get('/units/:unit_id/address', authenticateToken, addressController.getFullAddress);

export default router;