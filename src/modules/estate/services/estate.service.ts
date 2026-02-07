import { EstateCreationAttributes } from '../types/estate.types';
import { ApiResponse } from '../../../shared/types/api.types';
import { EstateRepository } from '../../estate/repositories/estate.repository';
import { Estate } from '../../estate/models/estate.model';
import { Referrer } from '../../payment/models/referrer.model';

class EstateService {
  private estateRepository: EstateRepository;

  constructor() {
    this.estateRepository = new EstateRepository();
  }
  async createEstate(data: EstateCreationAttributes & { referral_code?: string }): Promise<ApiResponse> {
    try {
      let estateData: any = { ...data };
      
      if (data.referral_code) {
        const referrer = await Referrer.findOne({ 
          where: { referral_code: data.referral_code } 
        });
        
        if (referrer) {
          estateData.referrer_id = referrer.id;
        }
      }
      
      delete estateData.referral_code;
      
      const estate = await this.estateRepository.create(estateData);
      if (!estate) {
        throw new Error('Failed to create estate');
      }
      return {
        success: true,
        message: 'Estate created successfully',
        data: estate
      };
    } catch (error) {
      throw error;
    }
  }

  async getAllEstates(): Promise<ApiResponse> {
    try {
      const estate = await this.estateRepository.findAll();
      if (!estate || estate.length === 0) {
        return {
          success: false,
          message: 'No estates found',
          data: []
        }
      }
      return {
        success: true,
        message: 'Estates retrieved successfully',
        data: estate
      }
    } catch (error) {
      throw error;
    }
  }

  async getOneEstate(estate_id: string, estate_code: string): Promise<ApiResponse | null> {
    try {
      if (!estate_id || !estate_code) {
        return {
          success: false,
          message: 'Estate ID or Code is required',
          data: null
        };
      }
      const estate = await this.estateRepository.findById(estate_id);
      if (!estate) {
        return {
          success: false,
          message: 'Estate not found',
          data: null
        };
      }
      return {
        success: true,
        message: 'Estates retrieved successfully',
        data: estate
      }
    } catch (error) {
      throw error;
    }
  }

  async updateEstate(id: string, data: Partial<Estate>): Promise<ApiResponse | null> {
    try {
      const estate = await this.estateRepository.update(id, data);
      if (!estate) {
        throw new Error('No estates found');
      }
      return {
        success: true,
        message: 'Estates retrieved successfully',
        data: estate
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteEstate(estate_id: string): Promise<ApiResponse> {
    try {
      const deleteEstate = await this.estateRepository.delete(estate_id);
      if (!deleteEstate) {
        return {
          success: false,
          message: 'Estate not found or already deleted',
          data: null
        }
      }
      return {
        success: true,
        message: 'Estate record deleted successfully',
        data: null
      }
    } catch (error) {
      throw error;
    }
  }

  async getEstatesByReferrer(referrerId: string): Promise<ApiResponse> {
    try {
      const estates = await Estate.findAll({
        where: { referrer_id: referrerId } as any,
        include: [{ model: Referrer }]
      });
      
      return {
        success: true,
        message: 'Referred estates retrieved successfully',
        data: estates
      };
    } catch (error) {
      throw error;
    }
  }
}

export default new EstateService();
