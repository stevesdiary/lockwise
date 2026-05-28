import { Request, Response } from 'express';
import { estateWalletService } from '../services/estate-wallet.service';
import { KudaNotConfiguredError } from '../types/kuda.types';

export const estateWalletController = {
  /** GET /kuda/estate-wallet/balance — manager gets their estate wallet balance + account info */
  async getBalance(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const estateId = user.estate_id;
      if (!estateId) {
        return res.status(400).json({ status: 'error', message: 'No estate linked to this account' });
      }

      const wallet = await estateWalletService.getOrCreate(estateId);
      return res.json({
        status: 'success',
        data: {
          balance: Number(wallet.balance),
          currency: wallet.currency,
          kuda_account_number: wallet.kuda_account_number,
          kuda_account_name: wallet.kuda_account_name,
        },
      });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  /** POST /kuda/estate-wallet/provision — lazy-provision Kuda virtual account for estate */
  async provisionAccount(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const estateId = user.estate_id;
      if (!estateId) {
        return res.status(400).json({ status: 'error', message: 'No estate linked to this account' });
      }

      const wallet = await estateWalletService.provisionKudaAccount(estateId);
      return res.json({
        status: 'success',
        data: {
          kuda_account_number: wallet.kuda_account_number,
          kuda_account_name: wallet.kuda_account_name,
          currency: wallet.currency,
        },
      });
    } catch (error: any) {
      if (error instanceof KudaNotConfiguredError) {
        return res.status(503).json({ status: 'error', message: 'Kuda wallet service is not available' });
      }
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },

  /** GET /kuda/estate-wallet/transactions */
  async getTransactions(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const estateId = user.estate_id;
      if (!estateId) {
        return res.status(400).json({ status: 'error', message: 'No estate linked to this account' });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const { rows, count } = await estateWalletService.getTransactions(estateId, limit, offset);
      return res.json({ status: 'success', data: { transactions: rows, total: count } });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  },
};
