import { Router } from 'express';
import locationController from '../controllers/location.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const router = Router();

// Location-based routes only (map functionality removed)
router.put('/location/:addressId', 
  authenticateToken,
  locationController.updateAddressLocation
);

router.get('/location/:addressId', 
  authenticateToken,
  locationController.getAddressLocation
);

export default router;