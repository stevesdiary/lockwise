import { Request as ExpressRequest, Response } from 'express';
import { createEstateSchema } from '../../utils/validator';
import estateService from './estate.service';
import { errorHandler, handleControllerError } from '../../middlewares/error.handler';

class EstateController {
  async createEstate(req: ExpressRequest, res: Response) {
    try {
      const estateCreationData = await createEstateSchema.validate(req.body, {
        abortEarly: false});

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

  async getEstateById(req: ExpressRequest, res: Response) {
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

  async updateEstate(req: ExpressRequest, res: Response) {
    try {
      const estate = await estateService.updateEstate(req.params.estateId, req.body);
      if (!estate) {
        return res.status(404).json({
          status: 'fail',
          message: 'Estate not found'
        });
      }
      return res.status(200).json({
        status: 'success',
        message: 'Estate updated successfully',
        data: estate
      });
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