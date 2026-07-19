import { Router } from 'express';
import { kudaWebhookController } from '../controllers/kuda-webhook.controller';
import { estateWalletController } from '../controllers/estate-wallet.controller';
import { authenticateToken, requireManager } from '../../../shared/middleware/auth.middleware';

const router = Router();

// Kuda webhook — no auth, signature-verified
router.post('/webhook', kudaWebhookController.handleWebhook);

// Estate wallet endpoints — managers only
router.get('/estate-wallet/balance', authenticateToken, requireManager, estateWalletController.getBalance);
router.post('/estate-wallet/provision', authenticateToken, requireManager, estateWalletController.provisionAccount);
router.get('/estate-wallet/transactions', authenticateToken, requireManager, estateWalletController.getTransactions);

export default router;
