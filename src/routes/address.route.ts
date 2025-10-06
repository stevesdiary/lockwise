import { Router } from 'express';
import addressController from '../controllers/address.controller';
import locationController from '../controllers/location.controller';
import { authenticateJWT } from '../middlewares/authentication';

const router = Router();

router.post('/upload', 
  authenticateJWT,
  addressController.uploadMiddleware,
  addressController.uploadAddresses
);

router.get('/map', 
  authenticateJWT,
  addressController.getEstateMap
);

router.get('/map/:estateId', 
  authenticateJWT,
  addressController.getEstateMap
);

router.put('/:addressId/location', 
  authenticateJWT,
  addressController.updateAddressLocation
);

router.get('/directions', 
  authenticateJWT,
  addressController.getDirections
);

router.put('/location/:addressId', 
  authenticateJWT,
  locationController.updateAddressLocation
);

router.get('/location/:addressId', 
  authenticateJWT,
  locationController.getAddressLocation
);

export default router;