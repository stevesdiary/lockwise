import { Request, Response } from 'express';
import { electricityService } from '../services/electricity.service';
import { DiscoCode, MeterType } from '../types/electricity.types';

const VALID_DISCOS: DiscoCode[] = [
  'EKEDC', 'IKEDC', 'JED', 'AEDC', 'PHED',
  'EEDC', 'KEDCO', 'BEDC', 'KAEDCO', 'IBEDC',
];

export const electricityController = {
  // ─── Meter Registration ───

  async registerMeter(req: Request, res: Response) {
    try {
      const meterNumber = req.body.meterNumber || req.body.meter_number;
      const disco = req.body.disco;
      const meterType = req.body.meterType || req.body.meter_type;
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      if (!meterNumber || !disco || !meterType) {
        return res.status(400).json({ error: 'meterNumber, disco, and meterType are required' });
      }
      if (!VALID_DISCOS.includes(disco)) {
        return res.status(400).json({ error: 'Invalid disco' });
      }

      const meter = await electricityService.registerMeter(userId, req.user?.estate_id || null, {
        meterNumber, disco, meterType,
      });
      res.status(201).json({ success: true, data: meter });
    } catch (error) {
      const msg = (error as Error).message;
      const status = msg.includes('already registered') || msg.includes('validation failed') ? 400 : 500;
      res.status(status).json({ error: msg });
    }
  },

  async getMyMeters(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      const meters = await electricityService.getUserMeters(userId);
      res.json({ success: true, data: meters });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },

  async toggleAutoLoad(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      const meterId = req.params.meterId as string;
      const meter = await electricityService.toggleAutoLoad(meterId, userId);
      res.json({ success: true, data: { auto_load_enabled: meter.auto_load_enabled } });
    } catch (error) {
      const msg = (error as Error).message;
      const status = msg.includes('not found') ? 404 : msg.includes('verified') ? 400 : 500;
      res.status(status).json({ error: msg });
    }
  },

  async deleteMeter(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ error: 'Authentication required' });
      await electricityService.deleteMeter(req.params.meterId as string, userId);
      res.json({ success: true, message: 'Meter removed' });
    } catch (error) {
      res.status(404).json({ error: (error as Error).message });
    }
  },

  // ─── Validation ───

  async validateMeter(req: Request, res: Response) {
    const meterNumber = req.body.meterNumber || req.body.meter_number;
    const disco = req.body.disco;
    const meterType = req.body.meterType || req.body.meter_type;
    if (!meterNumber || !disco || !meterType) {
      return res.status(400).json({ error: 'meterNumber, disco, and meterType are required' });
    }
    if (!VALID_DISCOS.includes(disco)) {
      return res.status(400).json({ error: 'Invalid disco' });
    }

    try {
      const result = await electricityService.validateMeter(meterNumber, disco as DiscoCode, meterType as MeterType);
      if (!result.valid) {
        return res.status(400).json({ success: false, error: 'Invalid meter number. Please check and try again.' });
      }
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, error: 'Meter verification failed. Please check the meter number and try again.' });
    }
  },

  // ─── Vend (manual) ───

  async vend(req: Request, res: Response) {
    const meterNumber = req.body.meterNumber || req.body.meter_number;
    const disco = req.body.disco;
    const meterType = req.body.meterType || req.body.meter_type;
    const amount = req.body.amount;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    if (!meterNumber || !disco || !meterType || !amount) {
      return res.status(400).json({ error: 'meterNumber, disco, meterType, and amount are required' });
    }
    if (!VALID_DISCOS.includes(disco)) return res.status(400).json({ error: 'Invalid disco' });
    if (Number(amount) < 500) return res.status(400).json({ error: 'Minimum vend amount is ₦500' });

    try {
      const result = await electricityService.vend({
        userId,
        estateId: req.user?.estate_id,
        meterNumber,
        disco: disco as DiscoCode,
        meterType: meterType as MeterType,
        amount: Number(amount),
      });
      res.status(result.success ? 200 : 502).json({
        success: result.success,
        data: {
          token: result.transaction.token,
          units: result.transaction.units,
          reference: result.transaction.request_id,
          provider: result.transaction.provider,
          status: result.transaction.status,
        },
        error: result.error,
      });
    } catch (error) {
      res.status(500).json({ error: 'Vend failed', details: (error as Error).message });
    }
  },

  // ─── Auto-load (uses registered smart meter) ───

  async autoLoad(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const meterId = req.params.meterId as string;
    const { amount } = req.body;
    if (!amount || Number(amount) < 500) {
      return res.status(400).json({ error: 'Minimum vend amount is ₦500' });
    }

    try {
      const result = await electricityService.autoLoadMeter(meterId, userId, Number(amount));
      res.status(result.success ? 200 : 502).json({
        success: result.success,
        data: {
          token: result.transaction.token,
          units: result.transaction.units,
          reference: result.transaction.request_id,
          provider: result.transaction.provider,
          status: result.transaction.status,
          auto_loaded: true,
        },
        error: result.error,
      });
    } catch (error) {
      const msg = (error as Error).message;
      const status = msg.includes('not found') ? 404 : msg.includes('not enabled') || msg.includes('not verified') ? 400 : 500;
      res.status(status).json({ error: msg });
    }
  },

  // ─── Requery ───

  async requery(req: Request, res: Response) {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ error: 'reference is required' });

    try {
      const result = await electricityService.requery(reference);
      res.json({ success: result.status === 'successful', data: result });
    } catch (error) {
      res.status(500).json({ error: 'Requery failed', details: (error as Error).message });
    }
  },

  // ─── Transaction History ───

  async getTransactions(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    try {
      const { rows, count } = await electricityService.getUserTransactions(userId, limit, offset);
      res.json({ success: true, data: { transactions: rows, total: count } });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  },
};
