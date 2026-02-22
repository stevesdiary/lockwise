import { Request, Response } from 'express';
import { evChargingService } from '../../parking/services/ev-charging.service';
import { asString } from '../../../shared/utils/param.util';

export const evChargingController = {
  async getChargingSlots(req: Request, res: Response) {
    try {
      const estateId = asString(req.params.estateId);
      const slots = await evChargingService.getEVChargingSlots(estateId);
      res.json({ success: true, data: slots });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async startSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { slot_id } = req.body;
      const session = await evChargingService.startChargingSession(userId, slot_id);
      res.status(201).json({ success: true, data: session });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async stopSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const sessionId = asString(req.params.sessionId);
      const { energy_consumed } = req.body;
      const result = await evChargingService.stopChargingSession(sessionId, userId, energy_consumed);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getMySessions(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const sessions = await evChargingService.getMyChargingSessions(userId);
      res.json({ success: true, data: sessions });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getActiveSession(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const session = await evChargingService.getActiveSession(userId);
      res.json({ success: true, data: session });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }
};
