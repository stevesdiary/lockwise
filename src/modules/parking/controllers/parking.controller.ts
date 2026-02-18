import { Request, Response } from 'express';
import { parkingService } from '../../parking/services/parking.service';
import { asString } from '../../../shared/utils/param.util';

export const parkingController = {
  async getMySlot(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const slot = await parkingService.getMyParkingSlot(userId);
      res.json({ success: true, data: slot });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  },

  async getEstateSlots(req: Request, res: Response) {
    try {
      const estateId = asString(req.params.estateId);
      const slots = await parkingService.getEstateSlots(estateId);
      res.json({ success: true, data: slots });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async releaseToGuest(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const guestParking = await parkingService.releaseSlotToGuest(userId, req.body);
      res.status(201).json({ success: true, data: guestParking });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getMyGuestParkings(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const guestParkings = await parkingService.getMyGuestParkings(userId);
      res.json({ success: true, data: guestParkings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async cancelGuestParking(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const id = asString(req.params.id);
      const guestParking = await parkingService.cancelGuestParking(id, userId);
      res.json({ success: true, data: guestParking });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};
