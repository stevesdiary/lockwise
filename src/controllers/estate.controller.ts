import { Request as ExpressRequest, Response } from 'express';
import { createEstateSchema } from '../utils/validator';
import estateService from '../services/estate.service';
import { errorHandler, handleControllerError } from '../middlewares/error.handler';
import { idSchema } from '../schemas/validation.schema';
import { customAlphabet } from 'nanoid';

class EstateController {
  async createEstate(req: ExpressRequest, res: Response) {
    try {
      const validatedData = await createEstateSchema.validate(req.body, {
        abortEarly: false});
      
      const estateCreationData = {
        name: validatedData.name,
        address: validatedData.address.street,
        type: validatedData.type,
        city: validatedData.address.city,
        state: validatedData.address.city,
        country: validatedData.address.country,
        estate_code: `EST${Date.now()}`,
        total_number_of_apartments: validatedData.number_of_appartments,
        total_number_of_floors: validatedData.total_number_of_floors,
        created_by: req.user!.id
      };

      const estate = await estateService.createEstate(estateCreationData);
      return res.json(estate);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getAllEstates(req: ExpressRequest, res: Response) {
    try {
      const estates = await estateService.getAllEstates();
      return res.status(200).json({
        status: 'success',
        message: 'Estates retrieved successfully',
        data: estates
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getEstateById(req: ExpressRequest, res: Response): Promise<Response> {
    try {
      const { estateId, estate_code } = req.params;
      if (!req.params.estateId || !req.params.estate_code) {
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
        return handleControllerError(error, res);
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
      const estate = await estateService.updateEstate(req.params.estateId, req.body);
      if (!estate) {
        return res.status(404).json({
          status: 'fail',
          message: 'Estate not found'
        });
      }
      return res.json( estate );
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async deleteEstate(req: ExpressRequest, res: Response) {
    try {
      const result = await estateService.deleteEstate(req.params.estateId);
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
      return res.status(500).json({
        status: 'error',
        message: 'Failed to delete estate',
        error: error
      });
    }
  }
}

export default new EstateController();