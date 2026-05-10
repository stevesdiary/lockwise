import { Router } from 'express';
import billsController from '../controllers/bills.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const router = Router();

// All providers
router.get('/providers', billsController.getProviders);

// Electricity
router.post('/electricity/verify', authenticateToken, billsController.verifyMeter);
router.post('/electricity/pay', authenticateToken, billsController.purchaseElectricity);

// Airtime
router.post('/airtime/pay', authenticateToken, billsController.purchaseAirtime);

// Data
router.get('/data/plans/:serviceID', authenticateToken, billsController.getDataPlans);
router.post('/data/pay', authenticateToken, billsController.purchaseData);

// TV
router.post('/tv/verify', authenticateToken, billsController.verifySmartcard);
router.get('/tv/plans/:serviceID', authenticateToken, billsController.getTVPlans);
router.post('/tv/pay', authenticateToken, billsController.purchaseTV);

// Shared
router.get('/requery/:requestId', authenticateToken, billsController.requeryTransaction);
router.get('/transactions', authenticateToken, billsController.getTransactions);

// Webhook
router.post('/webhook/vtpass', billsController.handleWebhook);

export default router;
