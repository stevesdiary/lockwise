import { Router } from 'express';
import accessCodeController from '../controllers/access.code.controller';
import { authenticateJWT } from '../middlewares/authentication';

const router = Router();

router.post('/generate', 
  // authenticateJWT,
  accessCodeController.generateCode
);

router.post('/custom', 
  // authenticateJWT,
  accessCodeController.generateCustomCode
);

router.post('/refresh-category', 
  // authenticateJWT,
  accessCodeController.refreshCategory
);

export default router;