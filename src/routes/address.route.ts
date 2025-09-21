import { Router } from 'express';
import addressController from '../controllers/address.controller';
import { authenticateJWT } from '../middlewares/authentication';

const router = Router();

router.post('/upload', 
  authenticateJWT,
  addressController.uploadMiddleware,
  addressController.uploadAddresses
);

export default router;