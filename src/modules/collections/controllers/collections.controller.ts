import { Request, Response } from 'express';
import { collectionsService } from '../services/collections.service';

export const collectionsController = {
  // ─── Fees (Manager) ───

  async createFee(req: Request, res: Response) {
    try {
      const user = req.user!;
      if (!user.estate_id) return res.status(400).json({ error: 'No estate linked' });
      const fee = await collectionsService.createFee(user.estate_id, user.id, req.body);
      res.status(201).json({ success: true, data: fee });
    } catch (error) { res.status(500).json({ error: (error as Error).message }); }
  },

  async getFees(req: Request, res: Response) {
    try {
      const estateId = req.user?.estate_id;
      if (!estateId) return res.status(400).json({ error: 'No estate linked' });
      const fees = await collectionsService.getEstateFees(estateId);
      res.json({ success: true, data: fees });
    } catch (error) { res.status(500).json({ error: (error as Error).message }); }
  },

  async updateFee(req: Request, res: Response) {
    try {
      const estateId = req.user?.estate_id;
      if (!estateId) return res.status(400).json({ error: 'No estate linked' });
      const fee = await collectionsService.updateFee(req.params.feeId as string, estateId, req.body);
      res.json({ success: true, data: fee });
    } catch (error) {
      const msg = (error as Error).message;
      res.status(msg.includes('not found') ? 404 : 500).json({ error: msg });
    }
  },

  async deleteFee(req: Request, res: Response) {
    try {
      const estateId = req.user?.estate_id;
      if (!estateId) return res.status(400).json({ error: 'No estate linked' });
      await collectionsService.deleteFee(req.params.feeId as string, estateId);
      res.json({ success: true, message: 'Fee deactivated' });
    } catch (error) { res.status(404).json({ error: (error as Error).message }); }
  },

  // ─── Invoices (Resident) ───

  async getMyInvoices(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      const status = req.query.status as string | undefined;
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const offset = Number(req.query.offset) || 0;
      const { rows, count } = await collectionsService.getResidentInvoices(userId, status, limit, offset);
      res.json({ success: true, data: { invoices: rows, total: count } });
    } catch (error) { res.status(500).json({ error: (error as Error).message }); }
  },

  async payInvoice(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      const invoice = await collectionsService.payInvoice(req.params.invoiceId as string, userId);
      res.json({ success: true, data: invoice });
    } catch (error) {
      const msg = (error as Error).message;
      const status = msg.includes('not found') ? 404 : msg.includes('Insufficient') ? 400 : msg.includes('already') ? 409 : 500;
      res.status(status).json({ error: msg });
    }
  },

  async waiveInvoice(req: Request, res: Response) {
    try {
      const estateId = req.user?.estate_id;
      if (!estateId) return res.status(400).json({ error: 'No estate linked' });
      const invoice = await collectionsService.waiveInvoice(req.params.invoiceId as string, estateId);
      res.json({ success: true, data: invoice });
    } catch (error) {
      const msg = (error as Error).message;
      res.status(msg.includes('not found') ? 404 : 400).json({ error: msg });
    }
  },

  // ─── Summary (Manager) ───

  async getSummary(req: Request, res: Response) {
    try {
      const estateId = req.user?.estate_id;
      if (!estateId) return res.status(400).json({ error: 'No estate linked' });
      const summary = await collectionsService.getEstateCollectionSummary(estateId);
      res.json({ success: true, data: summary });
    } catch (error) { res.status(500).json({ error: (error as Error).message }); }
  },

  async getResidentStatus(req: Request, res: Response) {
    try {
      const estateId = req.user?.estate_id;
      if (!estateId) return res.status(400).json({ error: 'No estate linked' });
      const invoices = await collectionsService.getResidentStatus(estateId, req.params.residentId as string);
      res.json({ success: true, data: invoices });
    } catch (error) { res.status(500).json({ error: (error as Error).message }); }
  },

  // ─── Withdrawal (Manager) ───

  async requestWithdrawal(req: Request, res: Response) {
    try {
      const user = req.user!;
      if (!user.estate_id) return res.status(400).json({ error: 'No estate linked' });
      const { amount, bank_code, account_number, account_name } = req.body;
      if (!amount || !bank_code || !account_number || !account_name) {
        return res.status(400).json({ error: 'amount, bank_code, account_number, and account_name are required' });
      }
      if (amount < 1000) return res.status(400).json({ error: 'Minimum withdrawal is ₦1,000' });

      const withdrawal = await collectionsService.requestWithdrawal(user.estate_id, user.id, { amount, bank_code, account_number, account_name });
      res.status(201).json({ success: true, data: withdrawal });
    } catch (error) {
      const msg = (error as Error).message;
      res.status(msg.includes('Insufficient') ? 400 : 500).json({ error: msg });
    }
  },

  async getWithdrawals(req: Request, res: Response) {
    try {
      const estateId = req.user?.estate_id;
      if (!estateId) return res.status(400).json({ error: 'No estate linked' });
      const limit = Math.min(Number(req.query.limit) || 20, 100);
      const offset = Number(req.query.offset) || 0;
      const { rows, count } = await collectionsService.getWithdrawals(estateId, limit, offset);
      res.json({ success: true, data: { withdrawals: rows, total: count } });
    } catch (error) { res.status(500).json({ error: (error as Error).message }); }
  },

  // ─── Invoice Generation (Manager triggers or cron) ───

  async generateInvoices(req: Request, res: Response) {
    try {
      const estateId = req.user?.estate_id;
      if (!estateId) return res.status(400).json({ error: 'No estate linked' });
      const { fee_id, billing_period } = req.body;
      if (!fee_id || !billing_period) return res.status(400).json({ error: 'fee_id and billing_period are required' });

      const count = await collectionsService.generateInvoices(estateId, fee_id, billing_period);
      res.json({ success: true, data: { invoices_created: count } });
    } catch (error) { res.status(500).json({ error: (error as Error).message }); }
  },
};
