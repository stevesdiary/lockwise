import { Request as ExpressRequest, Response } from 'express';
import { EstateRepository } from '../repositories/estate.repository';

class EstateController {
  private estateRepository: EstateRepository;

  constructor() {
    this.estateRepository = new EstateRepository();
  }

  async createEstate(req: ExpressRequest, res: Response) {
    try {
      const estate = await this.estateRepository.create(req.body);
      return res.status(201).json({
        status: 'success',
        message: 'Estate created successfully',
        data: estate
      });
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to create estate',
        error: error
      });
    }
  }

  async getAllEstates(req: ExpressRequest, res: Response) {
    try {
      const estates = await this.estateRepository.findAll();
      return res.status(200).json({
        status: 'success',
        message: 'Estates retrieved successfully',
        data: estates
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve estates',
        error: error
      });
    }
  }

  async getEstateById(req: ExpressRequest, res: Response) {
    try {
      const estate = await this.estateRepository.findById(req.params.estateId);
      if (!estate) {
        return res.status(404).json({
          status: 'fail',
          message: 'Estate not found'
        });
      }
      return res.status(200).json({
        status: 'success',
        message: 'Estate retrieved successfully',
        data: estate
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve estate',
        error: error
      });
    }
  }

  async updateEstate(req: ExpressRequest, res: Response) {
    try {
      const estate = await this.estateRepository.update(req.params.estateId, req.body);
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
      return res.status(500).json({
        status: 'error',
        message: 'Failed to update estate',
        error: error
      });
    }
  }

  async deleteEstate(req: ExpressRequest, res: Response) {
    try {
      const result = await this.estateRepository.delete(req.params.estateId);
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