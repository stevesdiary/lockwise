import { Router } from 'express';
import configController from '../controllers/config.controller';
import { authenticateJWT } from '../middlewares/authentication';

const router = Router();

router.get('/map', 
  authenticateJWT,
  configController.getMapConfig
);

export default router;