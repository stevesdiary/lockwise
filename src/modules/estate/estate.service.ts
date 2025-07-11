import { EstateCreationAttributes, ApiResponse } from '../../types/estate.type';
import { EstateRepository } from '../repositories/estate.repository';
import { Estate } from "./estate.model";

class EstateService {
  private estateRepository: EstateRepository;

  constructor() {
    this.estateRepository = new EstateRepository();
  }
  async createEstate(data: EstateCreationAttributes): Promise<ApiResponse> {
    const estate = await this.estateRepository.create(data);
    if (!estate) {
      throw new Error('Failed to create estate');
    }
    return {
      statusCode: 201,
      status: 'success',
      message: 'Estate created successfully',
      data: estate
    };
  }

  async getAllEstates(): Promise<ApiResponse> {
    const estate = await this.estateRepository.findAll();
    if (!estate || estate.length === 0) {
      return {
        statusCode: 404,
        status: 'fail',
        message: 'No estates found',
        data: []
      }
    }
    return {
      statusCode: 200,
      status: 'success',
      message: 'Estates retrieved successfully',
      data: estate
    }
  }

  async getOneEstate(estate_id: string, estate_code: string): Promise<ApiResponse | null> {
    if (!estate_id || !estate_code) {
      return {
        statusCode: 400,
        status: 'fail',
        message: 'Estate ID or Code is required',
        data: null
      };
    }
    const estate = await this.estateRepository.findById(estate_id);
    if (!estate) {
      return {
        statusCode: 404,
        status: 'fail',
        message: 'Estate not found',
        data: null
      };
    }
    return {
      statusCode: 200,
      status: 'success',
      message: 'Estates retrieved successfully',
      data: estate
    }
  }

  async updateEstate(id: string, data: Partial<Estate>): Promise<ApiResponse | null> {
    const estate = await this.estateRepository.update(id, data);
    if (!estate) {
      throw new Error('No estates found');
    }
    return {
      statusCode: 200,
      status: 'success',
      message: 'Estates retrieved successfully',
      data: estate
    }
  }

  async deleteEstate(estate_id: string): Promise<ApiResponse> {
    const deleteEstate = await this.estateRepository.delete(estate_id);
    if (!deleteEstate) {
      return {
        statusCode: 404,
        status: 'fail',
        message: 'Estate not found or already deleted',
        data: null
      }
    }
    return {
      statusCode: 200,
      status: 'success',
      message: 'Estate record deleted successfully',
      data: null
    }
  }
}

export default new EstateService();