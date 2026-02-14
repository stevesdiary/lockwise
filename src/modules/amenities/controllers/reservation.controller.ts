import { Request, Response } from 'express';
import { reservationService } from '../../amenities/services/reservation.service';

export const reservationController = {
  async createReservation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const reservation = await reservationService.createReservation(userId, req.body);
      res.status(201).json({ success: true, data: reservation });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getMyReservations(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const reservations = await reservationService.getUserReservations(userId);
      res.json({ success: true, data: reservations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async getEstateReservations(req: Request, res: Response) {
    try {
      const { estateId } = req.params;
      const { start_date, end_date } = req.query;
      const reservations = await reservationService.getEstateReservations(
        estateId,
        start_date ? new Date(start_date as string) : undefined,
        end_date ? new Date(end_date as string) : undefined
      );
      res.json({ success: true, data: reservations });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async cancelReservation(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { reservationId } = req.params;
      const { reason } = req.body;
      const reservation = await reservationService.cancelReservation(reservationId, userId, reason);
      res.json({ success: true, data: reservation });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getAvailableSlots(req: Request, res: Response) {
    try {
      const { amenityId } = req.params;
      const { date } = req.query;
      const slots = await reservationService.getAvailableSlots(amenityId, new Date(date as string));
      res.json({ success: true, data: slots });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};
