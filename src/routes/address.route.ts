import { Router } from 'express';
import locationController from '../controllers/location.controller';
import { authenticateJWT } from '../middlewares/authentication';

const router = Router();

// Location-based routes only (map functionality removed)
router.put('/location/:addressId', 
  authenticateJWT,
  locationController.updateAddressLocation
);

router.get('/location/:addressId', 
  authenticateJWT,
  locationController.getAddressLocation
);

export default router;