import { Request, Response } from 'express';
import walletService from '../services/wallet.service';
import paystackService from '../../payment/services/paystack.service';

class WalletController {
  /** GET /wallet/account — balance + Kuda virtual account info */
  async getAccount(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const result = await walletService.getWalletWithAccount(user.id);
      return res.json({ status: 'success', data: result });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /** GET /wallet/balance */
  async getBalance(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const result = await walletService.getBalance(user.id);
      return res.json({ status: 'success', data: result });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /** POST /wallet/fund — initiate Paystack payment to fund wallet */
  async fundWallet(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { amount } = req.body || {};

      if (!amount || amount < 100) {
        return res.status(400).json({ message: 'Minimum funding amount is ₦100' });
      }

      // Ensure wallet exists
      await walletService.getOrCreateWallet(user.id);

      const reference = `wlt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const result = await paystackService.initializeTransaction({
        amount,
        email: user.email,
        reference,
        metadata: { type: 'wallet_funding', user_id: user.id },
      });

      return res.json({ status: 'success', data: { authorization_url: result.data.authorization_url, reference } });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /** POST /wallet/verify — verify Paystack payment and credit wallet */
  async verifyFunding(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { reference } = req.body || {};

      if (!reference) {
        return res.status(400).json({ message: 'reference is required' });
      }

      const result = await paystackService.verifyTransaction(reference);
      if (!result.status || result.data.status !== 'success') {
        return res.status(400).json({ status: 'error', message: 'Payment not successful' });
      }

      const amount = result.data.amount / 100; // Paystack returns kobo
      const tx = await walletService.credit(user.id, amount, `Wallet funding via Paystack`, reference);

      return res.json({ status: 'success', data: { balance: tx.balance_after, amount, reference } });
    } catch (error: any) {
      if (error.message.includes('Wallet not found')) {
        return res.status(404).json({ status: 'error', message: 'Wallet not found' });
      }
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  /** GET /wallet/transactions */
  async getTransactions(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const { rows, count } = await walletService.getTransactions(user.id, limit, offset);
      return res.json({ status: 'success', data: { transactions: rows, total: count } });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }
}

export default new WalletController();
