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
import logger from '../../../shared/utils/logger';

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
      // Expose both `id` and `estate_id` so mobile clients can use either
      const plain = estate.toJSON ? estate.toJSON() : estate;
      return {
        statusCode: 200,
        success: true,
        message: 'Estate retrieved successfully',
        data: { ...plain, id: plain.estate_id }
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

      // Auto-provision the Free plan if estate has ≤50 residents and no subscription yet
      try {
        const { default: subscriptionService } = await import('../../payment/services/subscription.service');
        const existing = await subscriptionService.getCurrentSubscriptionForEstate(estateId);
        if (!existing.data) {
          const residentCount = await subscriptionService.getResidentCount(estateId);
          if (residentCount <= 50) {
            await subscriptionService.provisionFreePlan(estateId);
          }
        }
      } catch {
        // Non-fatal — subscription can be provisioned lazily on first status check
      }

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

  async rejectEstate(estateId: string, rejectedBy: string, reason?: string): Promise<ApiResponse> {
    try {
      const estate = await Estate.findByPk(estateId);
      if (!estate) {
        return { statusCode: 404, success: false, message: 'Estate not found', data: null };
      }

      await estate.update({
        approval_status: 'rejected',
        approved_by: rejectedBy,
      } as any);

      return {
        statusCode: 200,
        success: true,
        message: reason ? `Estate rejected: ${reason}` : 'Estate rejected',
        data: estate,
      };
    } catch (error) {
      throw error;
    }
  }

  async updateOnboardingStep(
    estateId: string,
    _userId: string,
    step: number,
    status?: string
  ): Promise<ApiResponse & { statusCode?: number }> {
    try {
      if (status === 'pending') {
        // Atomic conditional update: only flips to pending if currently draft
        const [affectedRows] = await Estate.update(
          { onboarding_step: step, status: 'pending' } as any,
          { where: { estate_id: estateId, status: 'draft' } as any }
        );
        if (affectedRows === 0) {
          const check = await Estate.findByPk(estateId);
          if (!check) {
            return { success: false, statusCode: 404, message: 'Estate not found', data: null };
          }
          return { success: false, statusCode: 409, message: 'Estate has already been submitted', data: null };
        }
        // Notify admins after successful atomic transition
        const estate = await Estate.findByPk(estateId);
        await this.notifyAdminsOnEstateSubmit(estate);
        return { success: true, statusCode: 200, message: 'Estate submitted for review', data: null };
      }

      // Non-status-change path: just update the step
      const estate = await this.estateRepository.findById(estateId);
      if (!estate) {
        return { success: false, message: 'Estate not found', data: null, statusCode: 404 };
      }

      await Estate.update({ onboarding_step: step } as any, { where: { estate_id: estateId } });

      return { success: true, message: 'Onboarding step updated', data: null };
    } catch (error) {
      throw error;
    }
  }

  async updateSetupChecklist(
    estateId: string,
    _userId: string,
    updates: Partial<{ gates_configured: boolean; residents_invited: boolean }>
  ): Promise<ApiResponse & { statusCode?: number }> {
    try {
      const estate = await this.estateRepository.findById(estateId);
      if (!estate) {
        return { success: false, message: 'Estate not found', data: null, statusCode: 404 };
      }

      const current = (estate as any).setup_checklist || { gates_configured: false, residents_invited: false };
      const merged = { ...current, ...updates };

      await Estate.update(
        { setup_checklist: merged },
        { where: { estate_id: estateId } }
      );

      return { success: true, message: 'Setup checklist updated', data: merged };
    } catch (error) {
      throw error;
    }
  }

  async getPendingUpdateEstates(): Promise<ApiResponse> {
    try {
      const estates = await Estate.findAll({
        where: { pending_update_data: { [Op.ne]: null } } as any,
        attributes: ['estate_id', 'name', 'estate_code', 'city', 'state', 'pending_update_data', 'logo_url', 'status', 'approval_status'],
      });
      return {
        statusCode: 200,
        success: true,
        message: 'Estates with pending updates retrieved successfully',
        data: estates.map(e => e.toJSON()),
      };
    } catch (error) {
      throw error;
    }
  }

  async requestEstateUpdate(estateId: string, managerId: string, proposedData: Record<string, any>): Promise<ApiResponse> {
    const estate = await Estate.findByPk(estateId);
    if (!estate) return { success: false, message: 'Estate not found', data: null };

    await estate.update({ pending_update_data: { ...proposedData, _requested_by: managerId, _requested_at: new Date().toISOString() } });

    // Notify admins
    this.notifyAdminsOnEstateUpdateRequest(estate.toJSON()).catch(() => undefined);

    return { success: true, message: 'Update request submitted — pending admin approval', data: null };
  }

  async applyEstateUpdate(estateId: string, approved: boolean, _rejectionReason?: string): Promise<ApiResponse> {
    const estate = await Estate.findByPk(estateId);
    if (!estate) return { success: false, message: 'Estate not found', data: null };
    if (!estate.pending_update_data) return { success: false, message: 'No pending update found', data: null };

    if (approved) {
      const { _requested_by, _requested_at, ...changes } = estate.pending_update_data as any;
      await estate.update({ ...changes, pending_update_data: null });
      return { success: true, message: 'Estate update approved and applied', data: estate.toJSON() };
    } else {
      await estate.update({ pending_update_data: null });
      return { success: true, message: 'Estate update rejected', data: null };
    }
  }

  private async notifyAdminsOnEstateUpdateRequest(estate: any): Promise<void> {
    try {
      const adminRoles = await Role.findAll({
        where: { role: { [Op.in]: ['admin', 'super_admin', 'master'] } },
        attributes: ['id'],
      });
      const adminRoleIds = adminRoles.map((r: any) => r.id);
      const admins = await User.findAll({ where: { role_id: { [Op.in]: adminRoleIds } } });
      const adminIds = admins.map((a: any) => a.id);

      if (adminIds.length > 0) {
        notificationService.queueWebPush(adminIds, {
          title: 'Estate Update Request',
          body: `${estate.name} manager has submitted changes for your review.`,
          tag: 'estate-update-request',
          url: `/admin/estates/${estate.estate_id}`,
        }).catch(() => undefined);
      }

      for (const admin of admins) {
        await notificationService.sendNotification({
          type: 'email',
          to: admin.email,
          template: 'estateUpdateRequest',
          data: { admin_name: (admin as any).first_name || admin.email, estate_name: estate.name },
          priority: 'normal',
        }).catch(() => undefined);
      }
    } catch (err) {
      logger.error('Failed to notify admins on estate update request', { error: err });
    }
  }

  private async notifyAdminsOnEstateSubmit(estate: any): Promise<void> {
    try {
      // Use a subquery via direct FK lookup — avoids relying on a Sequelize association
      // being registered at runtime, which may silently fail if the include is not set up.
      const adminRoles = await Role.findAll({
        where: { role: { [Op.in]: ['admin', 'super_admin', 'master'] } },
        attributes: ['id'],
      });
      const adminRoleIds = adminRoles.map((r: any) => r.id);
      const admins = await User.findAll({
        where: { role_id: { [Op.in]: adminRoleIds } },
      });

      const adminIds = admins.map((a: any) => a.id);

      for (const admin of admins) {
        try {
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
        } catch (err) {
          // Non-fatal — one admin failing to notify must not block the rest
          logger.error('Failed to notify admin on estate submit', { email: admin.email, error: err });
        }
      }

      // Web push to all admins with a browser session open on the admin dashboard
      if (adminIds.length > 0) {
        notificationService.queueWebPush(adminIds, {
          title: 'New Estate Submitted',
          body: `${estate.name} is awaiting your approval.`,
          tag: 'estate-submitted',
          url: `/admin/estates/${estate.estate_id}`,
        }).catch(() => undefined);
      }
    } catch (err) {
      // Non-fatal — log and continue
      logger.error('Failed to notify admins on estate submit', { error: err });
    }
  }
}

export default new EstateService();
