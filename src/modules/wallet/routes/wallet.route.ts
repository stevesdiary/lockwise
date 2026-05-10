import { Router } from 'express';
import walletController from '../controllers/wallet.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const router = Router();

router.get('/account', authenticateToken, walletController.getAccount);
router.get('/balance', authenticateToken, walletController.getBalance);
router.post('/fund', authenticateToken, walletController.fundWallet);
router.post('/verify', authenticateToken, walletController.verifyFunding);
router.get('/transactions', authenticateToken, walletController.getTransactions);

export default router;
