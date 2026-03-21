import { Op } from 'sequelize';
import { EstateCreationAttributes } from '../types/estate.types';
import { ApiResponse } from '../../../shared/types/api.types';
import { EstateRepository } from '../../estate/repositories/estate.repository';
import { Estate } from '../../estate/models/estate.model';
import { Referrer } from '../../payment/models/referrer.model';
import { User } from '../../auth/models/user.model';
import { Role } from '../../auth/models/role.model';
import sequelize from '../../../shared/core/database';
import emailService from '../../communication/services/email.service';
import notificationService from '../../communication/services/notification.service';

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

      estateData.status = 'draft';
      estateData.onboarding_step = 1;
      estateData.setup_checklist = { gates_configured: false, residents_invited: false };

      const estate = await sequelize.transaction(async (t) => {
        const created = await Estate.create(estateData, { transaction: t });
        if (!created) {
          throw new Error('Failed to create estate');
        }

        if (data.created_by) {
          await User.update(
            { estate_id: created.estate_id },
            { where: { id: data.created_by }, transaction: t }
          );
        }

        return created;
      });

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
          statusCode: 404,
          success: false,
          message: 'No estates found',
          data: []
        }
      }
      return {
        statusCode: 200,
        success: true,
        message: 'Estates retrieved successfully',
        data: estate
      }
    } catch (error) {
      throw error;
    }
  }

  async getOneEstate(estate_id: string): Promise<ApiResponse | null> {
    try {
      if (!estate_id) {
        return {
          success: false,
          message: 'Estate ID is required',
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
        statusCode: 200,
        success: true,
        message: 'Referred estates retrieved successfully',
        data: estates
      };
    } catch (error) {
      throw error;
    }
  }

  async getEstatesByStatus(status: string): Promise<ApiResponse> {
    try {
      const estates = await Estate.findAll({
        where: { approval_status: status } as any
      });
      if(estates.length === 0) {
        return {
          statusCode: 404,
          success: false,
          message: `No estates found with status '${status}'`,
          data: []
        }
      }
      return {
        statusCode: 200,
        success: true,
        message: `Estates with status '${status}' retrieved successfully`,
        data: estates
      };
    } catch (error) {
      throw error;
    }
  }

  async getEstateByCode(estate_code: string): Promise<ApiResponse> {
    try {
      const estate = await Estate.findOne({
        where: { estate_code } as any
      });
      if (!estate) {
        return {
          statusCode: 404,
          success: false,
          message: 'Estate not found',
          data: null
        };
      }
      return {
        statusCode: 200,
        success: true,
        message: 'Estate retrieved successfully',
        data: estate
      };
    } catch (error) {
      throw error;
    }
  }

  async approveEstate(estateId: string, approvedBy: string): Promise<ApiResponse> {
    try {
      const estate = await Estate.findByPk(estateId);
      if (!estate) {
        return {
          statusCode: 404,
          success: false,
          message: 'Estate not found',
          data: null
        };
      }

      await estate.update({
        approval_status: 'approved',
        approved_by: approvedBy,
        approved_on: new Date()
      } as any);

      return {
        statusCode: 200,
        success: true,
        message: 'Estate approved successfully',
        data: estate
      };
    } catch (error) {
      throw error;
    }
  }

  async updateOnboardingStep(
    estateId: string,
    userId: string,
    step: number,
    status?: string
  ): Promise<ApiResponse & { statusCode?: number }> {
    try {
      const estate = await this.estateRepository.findById(estateId);
      if (!estate) {
        return { success: false, message: 'Estate not found', data: null, statusCode: 404 };
      }

      // Guard: cannot flip to pending unless currently draft
      if (status === 'pending' && (estate as any).status !== 'draft') {
        return { success: false, message: 'Estate is not in draft status', data: null, statusCode: 409 };
      }

      const updates: Partial<{ onboarding_step: number; status: string }> = { onboarding_step: step };
      if (status === 'pending') {
        updates.status = 'pending';
      }

      await Estate.update(updates as any, { where: { estate_id: estateId } });

      if (status === 'pending') {
        await this.notifyAdminsOnEstateSubmit(estate);
      }

      return { success: true, message: 'Onboarding step updated', data: null };
    } catch (error) {
      throw error;
    }
  }

  private async notifyAdminsOnEstateSubmit(estate: any): Promise<void> {
    try {
      const admins = await User.findAll({
        include: [{ model: Role, where: { role: { [Op.in]: ['admin', 'super_admin'] } } }],
      });

      for (const admin of admins) {
        await emailService.sendEstateSubmittedEmail(admin.email, {
          admin_name: (admin as any).first_name || admin.email,
          estate_name: estate.name,
        });

        await notificationService.sendNotification({
          type: 'email',
          to: admin.email,
          template: 'estateSubmitted',
          data: { admin_name: (admin as any).first_name || admin.email, estate_name: estate.name },
          priority: 'high',
        });
      }
    } catch (err) {
      // Non-fatal — log and continue
      console.error('Failed to notify admins on estate submit:', err);
    }
  }
}

export default new EstateService();
