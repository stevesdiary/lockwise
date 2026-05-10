import { Router } from 'express';
import { collectionsController } from '../controllers/collections.controller';
import { authenticateToken, requireManager, requireResident } from '../../auth/middleware/auth.middleware';

const router = Router();

// Fee management (Manager)
router.post('/fees', authenticateToken, requireManager, collectionsController.createFee);
router.get('/fees', authenticateToken, collectionsController.getFees);
router.patch('/fees/:feeId', authenticateToken, requireManager, collectionsController.updateFee);
router.delete('/fees/:feeId', authenticateToken, requireManager, collectionsController.deleteFee);

// Invoice generation (Manager)
router.post('/invoices/generate', authenticateToken, requireManager, collectionsController.generateInvoices);

// Invoices (Resident)
router.get('/invoices', authenticateToken, collectionsController.getMyInvoices);
router.post('/invoices/:invoiceId/pay', authenticateToken, collectionsController.payInvoice);
router.patch('/invoices/:invoiceId/waive', authenticateToken, requireManager, collectionsController.waiveInvoice);

// Summary (Manager)
router.get('/summary', authenticateToken, requireManager, collectionsController.getSummary);
router.get('/residents/:residentId/status', authenticateToken, requireManager, collectionsController.getResidentStatus);

// Withdrawals (Manager)
router.post('/withdraw', authenticateToken, requireManager, collectionsController.requestWithdrawal);
router.get('/withdrawals', authenticateToken, requireManager, collectionsController.getWithdrawals);

export default router;
