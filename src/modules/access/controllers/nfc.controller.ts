import { Request, Response } from 'express';
import { nfcService } from '../../access/services/nfc.service';

export const nfcController = {
  async validateAccess(req: Request, res: Response) {
    try {
      const { card_uid, access_point, access_type } = req.body;
      const result = await nfcService.validateAccess(card_uid, access_point, access_type);
      res.json({ success: result.granted, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getMyCard(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const card = await nfcService.getMyCard(userId);
      res.json({ success: true, data: card });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getMyHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const history = await nfcService.getMyAccessHistory(userId);
      res.json({ success: true, data: history });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async reportLost(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const card = await nfcService.reportLost(userId);
      res.json({ success: true, data: card });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};
