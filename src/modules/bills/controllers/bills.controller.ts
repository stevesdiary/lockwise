import { Request, Response } from 'express';
import billsService from '../services/bills.service';
import {
  ElectricityProvider, ELECTRICITY_PROVIDERS,
  AirtimeProvider, AIRTIME_PROVIDERS,
  DataProvider, DATA_PROVIDERS,
  TVProvider, TV_PROVIDERS,
} from '../types/vtpass.types';

class BillsController {
  /** GET /bills/providers */
  async getProviders(_req: Request, res: Response) {
    return res.json({ status: 'success', data: billsService.getProviders() });
  }

  // ─── Electricity ──────────────────────────────────────────────────────────

  async verifyMeter(req: Request, res: Response) {
    try {
      const { serviceID, meterNumber, type } = req.body || {};
      if (!serviceID || !meterNumber || !type) return res.status(400).json({ message: 'serviceID, meterNumber, and type are required' });
      if (!ELECTRICITY_PROVIDERS[serviceID as ElectricityProvider]) return res.status(400).json({ message: 'Invalid serviceID' });
      if (!['prepaid', 'postpaid'].includes(type)) return res.status(400).json({ message: 'type must be prepaid or postpaid' });

      const result = await billsService.verifyMeter(serviceID, meterNumber, type);
      return res.json({ status: 'success', data: result });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async purchaseElectricity(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { serviceID, meterNumber, type, amount, phone, useWallet } = req.body || {};
      if (!serviceID || !meterNumber || !type || !amount || !phone) return res.status(400).json({ message: 'serviceID, meterNumber, type, amount, and phone are required' });
      if (!ELECTRICITY_PROVIDERS[serviceID as ElectricityProvider]) return res.status(400).json({ message: 'Invalid serviceID' });
      if (amount < 1000) return res.status(400).json({ message: 'Minimum amount is ₦1,000' });

      const result = await billsService.purchaseElectricity({ userId: user.id, estateId: user.estate_id, serviceID, meterNumber, type, amount, phone, useWallet });
      return res.status(201).json({ status: 'success', data: result });
    } catch (error: any) {
      const status = error.message === 'Insufficient balance' ? 400 : 500;
      return res.status(status).json({ status: 'error', message: error.message });
    }
  }

  // ─── Airtime ──────────────────────────────────────────────────────────────

  async purchaseAirtime(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { serviceID, phone, amount, useWallet } = req.body || {};
      if (!serviceID || !phone || !amount) return res.status(400).json({ message: 'serviceID, phone, and amount are required' });
      if (!AIRTIME_PROVIDERS[serviceID as AirtimeProvider]) return res.status(400).json({ message: 'Invalid serviceID' });
      if (amount < 50) return res.status(400).json({ message: 'Minimum amount is ₦50' });

      const result = await billsService.purchaseAirtime({ userId: user.id, estateId: user.estate_id, serviceID, phone, amount, useWallet });
      return res.status(201).json({ status: 'success', data: result });
    } catch (error: any) {
      const status = error.message === 'Insufficient balance' ? 400 : 500;
      return res.status(status).json({ status: 'error', message: error.message });
    }
  }

  // ─── Data ─────────────────────────────────────────────────────────────────

  async getDataPlans(req: Request, res: Response) {
    try {
      const { serviceID } = req.params as { serviceID: string };
      if (!DATA_PROVIDERS[serviceID as DataProvider]) return res.status(400).json({ message: 'Invalid serviceID' });

      const plans = await billsService.getDataPlans(serviceID as DataProvider);
      return res.json({ status: 'success', data: plans });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async purchaseData(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { serviceID, phone, variationCode, amount, useWallet } = req.body || {};
      if (!serviceID || !phone || !variationCode || !amount) return res.status(400).json({ message: 'serviceID, phone, variationCode, and amount are required' });
      if (!DATA_PROVIDERS[serviceID as DataProvider]) return res.status(400).json({ message: 'Invalid serviceID' });

      const result = await billsService.purchaseData({ userId: user.id, estateId: user.estate_id, serviceID, phone, variationCode, amount, useWallet });
      return res.status(201).json({ status: 'success', data: result });
    } catch (error: any) {
      const status = error.message === 'Insufficient balance' ? 400 : 500;
      return res.status(status).json({ status: 'error', message: error.message });
    }
  }

  // ─── TV ───────────────────────────────────────────────────────────────────

  async verifySmartcard(req: Request, res: Response) {
    try {
      const { serviceID, smartcardNumber } = req.body || {};
      if (!serviceID || !smartcardNumber) return res.status(400).json({ message: 'serviceID and smartcardNumber are required' });
      if (!TV_PROVIDERS[serviceID as TVProvider]) return res.status(400).json({ message: 'Invalid serviceID' });

      const result = await billsService.verifySmartcard(serviceID, smartcardNumber);
      return res.json({ status: 'success', data: result });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getTVPlans(req: Request, res: Response) {
    try {
      const { serviceID } = req.params as { serviceID: string };
      if (!TV_PROVIDERS[serviceID as TVProvider]) return res.status(400).json({ message: 'Invalid serviceID' });

      const plans = await billsService.getTVPlans(serviceID as TVProvider);
      return res.json({ status: 'success', data: plans });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async purchaseTV(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { serviceID, smartcardNumber, variationCode, amount, phone, subscriptionType, useWallet } = req.body || {};
      if (!serviceID || !smartcardNumber || !variationCode || !amount || !phone) return res.status(400).json({ message: 'serviceID, smartcardNumber, variationCode, amount, and phone are required' });
      if (!TV_PROVIDERS[serviceID as TVProvider]) return res.status(400).json({ message: 'Invalid serviceID' });

      const result = await billsService.purchaseTV({ userId: user.id, estateId: user.estate_id, serviceID, smartcardNumber, variationCode, amount, phone, subscriptionType, useWallet });
      return res.status(201).json({ status: 'success', data: result });
    } catch (error: any) {
      const status = error.message === 'Insufficient balance' ? 400 : 500;
      return res.status(status).json({ status: 'error', message: error.message });
    }
  }

  // ─── Shared ───────────────────────────────────────────────────────────────

  async requeryTransaction(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { requestId } = req.params as { requestId: string };
      const result = await billsService.requeryTransaction(requestId, user.id);
      return res.json({ status: 'success', data: result });
    } catch (error: any) {
      return res.status(400).json({ status: 'error', message: error.message });
    }
  }

  async getTransactions(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const { rows, count } = await billsService.getUserTransactions(user.id, limit, offset);
      return res.json({ status: 'success', data: { transactions: rows, total: count } });
    } catch (error: any) {
      return res.status(500).json({ status: 'error', message: error.message });
    }
  }

  async handleWebhook(req: Request, res: Response) {
    try { await billsService.handleWebhook(req.body); } catch {}
    return res.status(200).json({ status: 'ok' });
  }
}

export default new BillsController();
