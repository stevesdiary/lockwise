import { Request as ExpressRequest, Response } from 'express';
import { createEstateSchema } from '../../../shared/utils/validator';
import estateService from '../../estate/services/estate.service';
import { errorHandler, handleControllerError } from '../../../shared/middleware/error-handler.middleware';
import { idSchema } from '../../../shared/schemas/validation.schema';
import { customAlphabet } from 'nanoid';
import { asString } from '../../../shared/utils/param.util';

class EstateController {
  async createEstate(req: ExpressRequest, res: Response) {
    try {
      const validatedData = await createEstateSchema.validate(req.body, {
        abortEarly: false});
      
      const addressData = validatedData.address || validatedData.contact_address;
      
      // Filter out coordinates if incomplete
      const coordinates = validatedData.coordinates?.lat && validatedData.coordinates?.lng
        ? {
            lat: validatedData.coordinates.lat,
            lng: validatedData.coordinates.lng
          }
        : undefined;
      
      // Filter out geo_fencing if center coordinates are incomplete
      const geoFencing = validatedData.geo_fencing?.center?.lat && validatedData.geo_fencing?.center?.lng
        ? {
            center: {
              lat: validatedData.geo_fencing.center.lat,
              lng: validatedData.geo_fencing.center.lng
            },
            radius_meters: validatedData.geo_fencing.radius_meters
          }
        : undefined;
      
      const estateCreationData = {
        name: validatedData.name,
        type: validatedData.type,
        city: addressData?.city || '',
        state: validatedData.state || addressData?.city || '',
        country: addressData?.country || 'Nigeria',
        country_code: validatedData.country_code || 'NG',
        timezone: validatedData.timezone || 'Africa/Lagos',
        currency_code: validatedData.currency_code || 'NGN',
        estate_code: `EST${Date.now()}`,
        total_number_of_apartments: validatedData.number_of_appartments || 0,
        total_floors: validatedData.total_number_of_floors,
        location_details: {
          street_address: addressData?.street || '',
          area_district: addressData?.number || '',
          administrative_area: validatedData.state,
          postal_code: validatedData.postal_code,
          plus_code: validatedData.plus_code,
          digital_address: validatedData.digital_address,
          landmark: validatedData.landmark,
          coordinates: coordinates,
          format: validatedData.country_code === 'GH' ? 'GH-POST' : 'STANDARD'
        },
        contact_info: {
          phone: validatedData.contact_phone,
          email: validatedData.contact_email,
          address: addressData ? `${addressData.number ? addressData.number + ' ' : ''}${addressData.street}` : ''
        },
        access_points: validatedData.access_points || [],
        geo_fencing: geoFencing,
        created_by: req.user!.id,
        referral_code: validatedData.referral_code
      };

      const estate = await estateService.createEstate(estateCreationData);
      return res.json(estate);
    } catch (error) {
      console.error('Estate creation error:', error);
      return handleControllerError(error, res);
    }
  }

  async getAllEstates(req: ExpressRequest, res: Response) {
    try {
      const estates = await estateService.getAllEstates();
      return res.status(estates.statusCode || 200).json({
        status: estates.success ? 'success' : 'fail',
        message: estates.message,
        data: estates.data
      });
    } catch (error) {
      console.error('Get all estates error:', error);
      return handleControllerError(error, res);
    }
  }

  async getEstateById(req: ExpressRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      const estate_code = asString(req.params.estate_code);
      if (!estateId || !estate_code) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }
      const getEstateData = {
        estate_id: estateId,
        estate_code: estate_code
      };
      const estate = await estateService.getOneEstate(getEstateData.estate_id, getEstateData.estate_code);
      return res.json(estate);
    } catch (error) {
      console.error('Get estate by ID error:', error);
      return handleControllerError(error, res);
    }
  }

  async getEstateByCode(req: ExpressRequest, res: Response): Promise<Response> {
    try {
      const estate_code = asString(req.params.estate_code);
      if (!estate_code) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate code is required'
        });
      }
      const estate = await estateService.getEstateByCode(estate_code);
      return res.status(estate.statusCode || 200).json({
        status: estate.success ? 'success' : 'fail',
        message: estate.message,
        data: estate.data
      });
    } catch (error) {
      console.error('Get estate by code error:', error);
      return handleControllerError(error, res);
    }
  }

  async searchEstate(req: ExpressRequest, res: Response): Promise<Response> {
    try {
      const estate_code = asString(req.params.estate_code);
      if (!estate_code) {
        return res.status(400).json({ success: false, message: 'Estate code is required' });
      }
      const estate = await estateService.getEstateByCode(estate_code);
      if (estate.success && estate.data) {
        return res.json({ success: true, message: 'Estate found', data: estate.data });
      }
      return res.status(404).json({ success: false, message: 'Estate not found' });
    } catch (error) {
      console.error('Search estate error:', error);
      return res.status(500).json({ success: false, message: 'Failed to search estate' });
    }
  }

  async updateEstate(req: ExpressRequest, res: Response): Promise<Response> {
    // const estateId = await idSchema.validate(req.params.estate_id)
    const estateId = req.user?.estateId
    if (!estateId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Estate ID is required'
      });
    }
    try {
      const estate = await estateService.updateEstate(asString(req.params.estateId), req.body);
      if (!estate) {
        return res.status(404).json({
          status: 'fail',
          message: 'Estate not found'
        });
      }
      return res.json( estate );
    } catch (error) {
      console.error('Update estate error:', error);
      return handleControllerError(error, res);
    }
  }

  async getPendingEstates(req: ExpressRequest, res: Response): Promise<Response> {
    try {
      const estates = await estateService.getEstatesByStatus('pending');
      return res.status(estates.statusCode || 200).json({
        status: estates.success ? 'success' : 'fail',
        message: estates.message,
        data: estates.data
      });
    } catch (error) {
      console.error('Get pending estates error:', error);
      return handleControllerError(error, res);
    }
  }

  async approveEstate(req: ExpressRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      const approvedBy = req.user!.id;

      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }

      const result = await estateService.approveEstate(estateId, approvedBy);
      return res.status(result.statusCode || 200).json({
        status: result.success ? 'success' : 'fail',
        message: result.message,
        data: result.data
      });
    } catch (error) {
      console.error('Approve estate error:', error);
      return handleControllerError(error, res);
    }
  }

  async deleteEstate(req: ExpressRequest, res: Response) {
    try {
      const result = await estateService.deleteEstate(asString(req.params.estateId));
      if (!result) {
        return res.status(404).json({
          status: 'fail',
          message: 'Estate not found'
        });
      }
      return res.status(200).json({
        status: 'success',
        message: 'Estate deleted successfully'
      });
    } catch (error) {
      console.error('Delete estate error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete estate',
        error: error
      });
    }
  }
}

export default new EstateController();