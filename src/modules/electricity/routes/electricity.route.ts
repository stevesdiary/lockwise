import { Router } from 'express';
import { electricityController } from '../controllers/electricity.controller';
import { authenticateToken } from '../../../shared/middleware/auth.middleware';

const router = Router();

// Meter management
router.post('/meters', authenticateToken, electricityController.registerMeter);
router.get('/meters', authenticateToken, electricityController.getMyMeters);
router.patch('/meters/:meterId/auto-load', authenticateToken, electricityController.toggleAutoLoad);
router.delete('/meters/:meterId', authenticateToken, electricityController.deleteMeter);

// Validation & vending
router.post('/validate-meter', authenticateToken, electricityController.validateMeter);
router.post('/vend', authenticateToken, electricityController.vend);
router.post('/meters/:meterId/auto-load', authenticateToken, electricityController.autoLoad);

// Requery & history
router.post('/requery', authenticateToken, electricityController.requery);
router.get('/transactions', authenticateToken, electricityController.getTransactions);

export default router;
