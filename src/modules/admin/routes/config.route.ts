import { Router } from 'express';
import configController from '../controllers/config.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const router = Router();

router.get('/map', 
  authenticateToken,
  configController.getMapConfig
);

export default router;