import { Request, Response } from 'express';
import { handleControllerError } from '../middlewares/error.handler';
import { Address } from '../models/address.model';
import geocodingService from '../services/geocoding.service';

class LocationController {
  async updateAddressLocation(req: Request, res: Response) {
    try {
      const { addressId } = req.params;
      const { latitude, longitude, formatted_address } = req.body;

      const address = await Address.findByPk(addressId);
      if (!address) {
        return res.status(404).json({
          status: 'fail',
          message: 'Address not found'
        });
      }

      await address.update({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      });

      return res.status(200).json({
        status: 'success',
        message: 'Location updated successfully',
        data: {
          address_id: addressId,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          formatted_address
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getAddressLocation(req: Request, res: Response) {
    try {
      const { addressId } = req.params;

      const address = await Address.findByPk(addressId, {
        attributes: ['address_id', 'apartment_number', 'street', 'building', 'city', 'state', 'country', 'latitude', 'longitude']
      });

      if (!address) {
        return res.status(404).json({
          status: 'fail',
          message: 'Address not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: address
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new LocationController();