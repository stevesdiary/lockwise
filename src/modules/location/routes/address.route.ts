import { Router } from 'express';
import locationController from '../controllers/location.controller';
import { authenticateToken } from '../../../shared/middleware/auth.middleware';

const router = Router();

// CSRF Protection: PUT route uses JWT token in Authorization header (not cookies)
// which inherently protects against CSRF attacks as browsers don't auto-send custom headers

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