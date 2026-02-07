import { Request, Response } from 'express';
import { amenityService } from '../../amenities/services/amenity.service';

export const amenityController = {
  async createAmenity(req: Request, res: Response) {
    try {
      const { estateId } = req.params;
      const amenity = await amenityService.createAmenity(estateId, req.body);
      res.status(201).json({ success: true, data: amenity });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async getEstateAmenities(req: Request, res: Response) {
    try {
      const { estateId } = req.params;
      const amenities = await amenityService.getEstateAmenities(estateId);
      res.json({ success: true, data: amenities });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  },

  async updateAmenity(req: Request, res: Response) {
    try {
      const { amenityId } = req.params;
      const amenity = await amenityService.updateAmenity(amenityId, req.body);
      res.json({ success: true, data: amenity });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  async deleteAmenity(req: Request, res: Response) {
    try {
      const { amenityId } = req.params;
      await amenityService.deleteAmenity(amenityId);
      res.json({ success: true, message: 'Amenity deleted' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
};
