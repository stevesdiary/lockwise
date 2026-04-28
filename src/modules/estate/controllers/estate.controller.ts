import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../../auth/middleware/auth.middleware';
import { createEstateSchema } from '../../../shared/utils/validator';
import estateService from '../../estate/services/estate.service';
import gateService from '../services/gate.service';
import estateInvitationService from '../services/estate-invitation.service';
import { errorHandler, handleControllerError } from '../../../shared/middleware/error-handler.middleware';
import { idSchema } from '../../../shared/schemas/validation.schema';
import { customAlphabet } from 'nanoid';
import { asString } from '../../../shared/utils/param.util';
import { User } from '../../auth/models/user.model';
import { Resident } from '../models/resident.model';
import { Unit } from '../models/unit.model';
import { Street } from '../models/street.model';
import fileUploadService from '../../upload/services/file-upload.service';
import { Estate } from '../models/estate.model';

class EstateController {
  async createEstate(req: AuthRequest, res: Response) {
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
      
      const estateCodeAlphabet = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
      const estateCreationData = {
        name: validatedData.name,
        type: validatedData.type,
        city: addressData?.city || '',
        state: validatedData.state || addressData?.city || '',
        country: addressData?.country || 'Nigeria',
        country_code: validatedData.country_code || 'NG',
        timezone: validatedData.timezone || 'Africa/Lagos',
        currency_code: validatedData.currency_code || 'NGN',
        estate_code: `EST-${estateCodeAlphabet()}`,
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

  async getAllEstates(req: AuthRequest, res: Response) {
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

  async getEstateById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }
      const estate = await estateService.getOneEstate(estateId);
      return res.json(estate);
    } catch (error) {
      console.error('Get estate by ID error:', error);
      return handleControllerError(error, res);
    }
  }

  async getEstateByCode(req: AuthRequest, res: Response): Promise<Response> {
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

  async searchEstate(req: AuthRequest, res: Response): Promise<Response> {
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

  async updateEstate(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);

      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }

      const userId = req.user!.id;
      const userRole = (req.user!.role as string)?.toLowerCase() || '';
      const isAdmin = ['master', 'super_admin', 'admin'].includes(userRole);

      if (!isAdmin) {
        const existing = await estateService.getOneEstate(estateId);
        if (!existing?.data || existing.data.created_by !== userId) {
          return res.status(403).json({ success: false, message: 'Forbidden: you do not own this estate' });
        }
      }

      const { status, approval_status, created_by, approved_by, estate_id, ...safeBody } = req.body;

      if (!isAdmin) {
        // Managers submit for approval — changes are not applied directly
        const result = await estateService.requestEstateUpdate(estateId, userId, safeBody);
        return res.status(202).json(result);
      }

      const estate = await estateService.updateEstate(estateId, safeBody);
      if (!estate) {
        return res.status(404).json({ status: 'fail', message: 'Estate not found' });
      }
      return res.json(estate);
    } catch (error) {
      console.error('Update estate error:', error);
      return handleControllerError(error, res);
    }
  }

  async applyEstateUpdate(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      const { approved, rejection_reason } = req.body;

      if (typeof approved !== 'boolean') {
        return res.status(400).json({ success: false, message: '`approved` (boolean) is required' });
      }

      const result = await estateService.applyEstateUpdate(estateId, approved, rejection_reason);
      return res.json(result);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getEstatesWithPendingUpdates(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const result = await estateService.getPendingUpdateEstates();
      return res.status(result.statusCode || 200).json(result);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getPendingEstates(req: AuthRequest, res: Response): Promise<Response> {
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

  async approveEstate(req: AuthRequest, res: Response): Promise<Response> {
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

  async rejectEstate(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      const { reason } = req.body;
      const rejectedBy = req.user!.id;

      if (!estateId) {
        return res.status(400).json({ status: 'fail', message: 'Estate ID is required' });
      }

      const result = await estateService.rejectEstate(estateId, rejectedBy, reason);
      return res.status(result.statusCode || 200).json({
        status: result.success ? 'success' : 'fail',
        message: result.message,
        data: result.data,
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async updateOnboardingStep(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      const { step, status } = req.body as { step: number; status?: string };
      const userId = req.user!.id;

      if (!estateId || typeof step !== 'number' || step < 1 || step > 3) {
        return res.status(400).json({ success: false, message: 'estateId and step (1-3) are required' });
      }

      const userRole = (req.user!.role as string)?.toLowerCase() || '';
      const isAdmin = ['master', 'super_admin', 'admin'].includes(userRole);
      if (!isAdmin) {
        const existing = await estateService.getOneEstate(estateId);
        if (!existing?.data || existing.data.created_by !== userId) {
          return res.status(403).json({ success: false, message: 'Forbidden: you do not own this estate' });
        }
      }

      const result = await estateService.updateOnboardingStep(estateId, userId, step, status);
      return res.status(result.statusCode || (result.success ? 200 : 400)).json(result);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async updateSetupChecklist(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      const { gates_configured, residents_invited } = req.body;
      const updates: Partial<{ gates_configured: boolean; residents_invited: boolean }> = {};
      if (typeof gates_configured === 'boolean') updates.gates_configured = gates_configured;
      if (typeof residents_invited === 'boolean') updates.residents_invited = residents_invited;
      const userId = req.user!.id;

      if (!estateId) {
        return res.status(400).json({ success: false, message: 'estateId is required' });
      }

      const userRole = (req.user!.role as string)?.toLowerCase() || '';
      const isAdmin = ['master', 'super_admin', 'admin'].includes(userRole);
      if (!isAdmin) {
        const existing = await estateService.getOneEstate(estateId);
        if (!existing?.data || existing.data.created_by !== userId) {
          return res.status(403).json({ success: false, message: 'Forbidden: you do not own this estate' });
        }
      }

      const result = await estateService.updateSetupChecklist(estateId, userId, updates);
      return res.status(result.statusCode || (result.success ? 200 : 400)).json(result);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async deleteDraftEstate(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      const userId = req.user!.id;

      if (!estateId) {
        return res.status(400).json({ success: false, message: 'estateId is required' });
      }

      const existing = await estateService.getOneEstate(estateId);
      if (!existing?.data) {
        return res.status(404).json({ success: false, message: 'Estate not found' });
      }

      if (existing.data.status !== 'draft') {
        return res.status(400).json({ success: false, message: 'Only draft estates can be deleted this way' });
      }

      const userRole = (req.user!.role as string)?.toLowerCase() || '';
      const isAdmin = ['master', 'super_admin', 'admin'].includes(userRole);
      if (!isAdmin && existing.data.created_by !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      await estateService.deleteEstate(estateId);
      return res.status(200).json({ success: true, message: 'Draft estate deleted' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async deleteEstate(req: AuthRequest, res: Response) {
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

  async createGate(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      const { gate_name, gate_type, access_control_type } = req.body;
      if (!estateId || !gate_name || !gate_type) {
        return res.status(400).json({
          success: false,
          message: 'estateId, gate_name, and gate_type are required',
        });
      }
      const estateCheck = await estateService.getOneEstate(estateId);
      if (!estateCheck?.data) {
        return res.status(404).json({ success: false, message: 'Estate not found' });
      }
      const userId = req.user!.id;
      const userRole = (req.user!.role as string)?.toLowerCase() || '';
      const isAdmin = ['master', 'super_admin', 'admin'].includes(userRole);
      if (!isAdmin && estateCheck.data.created_by !== userId) {
        return res.status(403).json({ success: false, message: 'Forbidden: you do not own this estate' });
      }
      const result = await gateService.createGate(estateId, { gate_name, gate_type, access_control_type });
      return res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getGates(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      if (!estateId) {
        return res.status(400).json({ success: false, message: 'estateId is required' });
      }
      const result = await gateService.getGates(estateId);
      return res.status(200).json(result);
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getEstateResidents(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      const { search, street } = req.query as { search?: string; street?: string };

      if (!estateId) {
        return res.status(400).json({ success: false, message: 'estateId is required' });
      }

      const userWhere: any = {};
      if (search?.trim()) {
        userWhere[Op.or] = [
          { first_name: { [Op.iLike]: `%${search.trim()}%` } },
          { last_name: { [Op.iLike]: `%${search.trim()}%` } },
        ];
      }

      const streetWhere: any = {};
      if (street?.trim()) {
        streetWhere.name = { [Op.iLike]: `%${street.trim()}%` };
      }

      const residents = await Resident.findAll({
        where: { estate_id: estateId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name', 'email', 'phone'],
            where: Object.keys(userWhere).length ? userWhere : undefined,
            required: true,
          },
          {
            model: Unit,
            as: 'unit',
            attributes: ['id', 'unit_identifier', 'unit_type'],
            required: false,
            include: [
              {
                model: Street,
                as: 'street',
                attributes: ['id', 'name'],
                where: Object.keys(streetWhere).length ? streetWhere : undefined,
                required: Object.keys(streetWhere).length > 0,
              },
            ],
          },
        ],
        order: [[{ model: User, as: 'user' }, 'first_name', 'ASC']],
      });

      return res.json({ success: true, data: residents });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async removeResidentFromEstate(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      const residentId = asString(req.params.residentId);

      if (!estateId || !residentId) {
        return res.status(400).json({ success: false, message: 'estateId and residentId are required' });
      }

      const resident = await Resident.findOne({ where: { resident_id: residentId, estate_id: estateId } });
      if (!resident) {
        return res.status(404).json({ success: false, message: 'Resident not found in this estate' });
      }

      // Detach resident from estate and unit
      await resident.update({ estate_id: null, unit_id: null });

      // Also clear the user's estate linkage
      await User.update({ estate_id: null as any }, { where: { id: resident.user_id } });

      return res.json({ success: true, message: 'Resident removed from estate' });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async joinByInvitation(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ success: false, message: 'Invitation token is required' });
      }

      // Validate the token
      const validation = await estateInvitationService.validateInvitationToken(token);
      if (!validation.valid || !validation.estate_id) {
        return res.status(400).json({ success: false, message: validation.message || 'Invalid or expired invitation' });
      }

      // Link user to estate
      const userId = req.user!.id;
      await User.update({ estate_id: validation.estate_id }, { where: { id: userId } });

      return res.status(200).json({
        success: true,
        message: 'Successfully joined estate',
        data: { estate_id: validation.estate_id },
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async uploadLogo(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const estateId = asString(req.params.estateId);
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file provided' });
      }

      const estate = await Estate.findByPk(estateId);
      if (!estate) {
        return res.status(404).json({ success: false, message: 'Estate not found' });
      }

      const userRole = (req.user!.role as string)?.toLowerCase() || '';
      const isAdmin = ['master', 'super_admin', 'admin'].includes(userRole);
      if (!isAdmin && req.user!.estate_id !== estateId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      const result = await fileUploadService.uploadFile(req.file, 'estate-logos');
      if (!result.success || !result.url) {
        return res.status(500).json({ success: false, message: result.error || 'Upload failed' });
      }

      await estate.update({ logo_url: result.url });

      return res.status(200).json({
        success: true,
        message: 'Logo uploaded successfully',
        data: { logo_url: result.url },
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new EstateController();