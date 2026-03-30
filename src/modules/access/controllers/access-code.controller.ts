import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../../auth/middleware/auth.middleware';
import accessCodeService from '../services/access-code.service';
import AccessLog from '../models/access-log.model';
import { User } from '../../auth/models/user.model';
import logger from '../../../shared/utils/logger';
import { getResidentFullAddress, formatAccessCodeMessage, buildGoogleMapsSearchUrl } from '../../../shared/utils/address.util';
import notificationService from '../../../shared/services/notification.service';
import { pushNotificationService } from '../../communication/services/push-notification.service';
import { UserRole } from '../../../shared/constants/permissions';

export const accessCodeController = {
  async getAccessCodes(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const accessCodes = await AccessLog.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        data: accessCodes.map(code => {
          const json = code.toJSON() as any;
          return { ...json, created_at: json.created_at ?? json.createdAt };
        })
      });
    } catch (error: any) {
      logger.error('Get access codes error:', error);
      return res.status(500).json({ message: 'Failed to fetch access codes' });
    }
  },

  async generateCode(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const estateId = req.user?.estate_id;
      const { visitor_name, valid_until, valid_from, visitor_phone, access_type } = req.body;

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (req.user?.role === UserRole.SECURITY) {
        return res.status(403).json({
          success: false,
          message: 'Security personnels are not allowed to create access codes'
        });
      }

      if (!estateId) {
        return res.status(400).json({ message: 'Estate ID is required. Please link your account to an estate.' });
      }

      if (!visitor_name || !valid_until) {
        return res.status(400).json({ message: 'visitor_name and valid_until are required' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const validFromDate = valid_from ? new Date(valid_from) : new Date();
      const validUntilDate = new Date(valid_until);
      
      // Get resident full address
      const fullAddress = await getResidentFullAddress(userId);
      const destinationMapsUrl = buildGoogleMapsSearchUrl(fullAddress);
      
      const accessCode = await accessCodeService.generateCode({
        user_id: userId,
        estate_id: estateId,
        code,
        guest_name: visitor_name,
        guest_phone: visitor_phone,
        access_type,
        valid_from: validFromDate,
        valid_until: validUntilDate,
      });

      // Format share message
      const shareMessage = formatAccessCodeMessage(
        visitor_name,
        code,
        fullAddress,
        validFromDate,
        validUntilDate,
        destinationMapsUrl
      );

      const codeJson = accessCode.toJSON() as any;
      return res.status(201).json({
        success: true,
        message: 'Access code generated',
        data: {
          ...codeJson,
          created_at: codeJson.created_at ?? codeJson.createdAt,
          fullAddress,
          destinationAddress: fullAddress || null,
          destinationMapsUrl: destinationMapsUrl || null,
          shareMessage
        }
      });
    } catch (error: any) {
      logger.error('Generate access code error:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate access code', error: error.message });
    }
  },

  async validateCode(req: AuthRequest, res: Response) {
    try {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ message: 'Code is required' });
      }

      const accessLog = await AccessLog.findOne({
        where: { access_code: code, status: 'active' },
        include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'phone'] }]
      });

      if (!accessLog) {
        return res.status(404).json({ success: false, message: 'Invalid or expired access code' });
      }

      if (accessLog.valid_until && new Date() > new Date(accessLog.valid_until)) {
        return res.status(400).json({ success: false, message: 'Access code expired' });
      }

      return res.status(200).json({
        success: true,
        message: 'Access code validated',
        data: accessLog
      });
    } catch (error: any) {
      logger.error('Validate access code error:', error);
      return res.status(500).json({ success: false, message: 'Failed to validate access code' });
    }
  },

  async approveAccess(req: AuthRequest, res: Response) {
    try {
      const { code } = req.body;
      const securityId = req.user?.id;

      if (!code) {
        return res.status(400).json({ success: false, message: 'Code is required' });
      }

      const accessLog = await AccessLog.findOne({
        where: { access_code: code, status: 'active' },
        include: [{ model: User, as: 'user', attributes: ['id', 'phone'] }]
      });

      if (!accessLog) {
        return res.status(404).json({ success: false, message: 'Access code not found' });
      }

      await accessLog.update({
        status: 'approved',
        entry_time: new Date(),
        scanned_by: securityId
      });

      if (accessLog.user_id) {
        pushNotificationService.sendToUser(
          accessLog.user_id,
          'Guest Entry',
          `${accessLog.guest_name || 'Guest'} has entered the estate`,
          { type: 'entry', code, status: 'approved' }
        ).catch(err => logger.error('Push notification error:', err));
      } else if (accessLog.user?.phone) {
        notificationService.sendEntryNotification(
          accessLog.user.phone,
          accessLog.guest_name || 'Guest',
          code,
          'approved'
        ).catch(err => logger.error('Notification error:', err));
      }

      return res.status(200).json({
        success: true,
        message: 'Access approved',
        data: accessLog
      });
    } catch (error: any) {
      logger.error('Approve access error:', error);
      return res.status(500).json({ success: false, message: 'Failed to approve access' });
    }
  },

  async revokeCode(req: AuthRequest, res: Response) {
    try {
      const { code } = req.params;
      const userId = req.user?.id;

      const accessLog = await AccessLog.findOne({
        where: { access_code: code, user_id: userId, status: { [Op.in]: ['active', 'pending'] } }
      });

      if (!accessLog) {
        return res.status(404).json({ success: false, message: 'Access code not found or cannot be revoked' });
      }

      await accessLog.update({ status: 'revoked' });

      return res.status(200).json({ success: true, message: 'Access code revoked', data: accessLog });
    } catch (error: any) {
      logger.error('Revoke access code error:', error);
      return res.status(500).json({ success: false, message: 'Failed to revoke access code' });
    }
  },

  async confirmAccess(req: AuthRequest, res: Response) {
    try {
      const { code } = req.params;
      const userId = req.user?.id;

      const accessLog = await AccessLog.findOne({
        where: { access_code: code, user_id: userId }
      });

      if (!accessLog) {
        return res.status(404).json({ success: false, message: 'Access code not found' });
      }

      await accessLog.update({ status: 'used' });

      if (accessLog.user_id) {
        pushNotificationService.sendToUser(
          accessLog.user_id,
          'Guest Check-in',
          `${accessLog.guest_name || 'Guest'} has checked-in`,
          { type: 'checkin', code }
        ).catch(err => logger.error('Push notification error:', err));
      }

      return res.status(200).json({ success: true, message: 'Access confirmed', data: accessLog });
    } catch (error: any) {
      logger.error('Confirm access error:', error);
      return res.status(500).json({ success: false, message: 'Failed to confirm access' });
    }
  },

  async rejectAccess(req: AuthRequest, res: Response) {
    try {
      const { code, reason } = req.body;
      const securityId = req.user?.id;

      if (!code) {
        return res.status(400).json({ success: false, message: 'Code is required' });
      }

      const accessLog = await AccessLog.findOne({
        where: { access_code: code, status: 'active' },
        include: [{ model: User, as: 'user', attributes: ['id', 'phone'] }]
      });

      if (!accessLog) {
        return res.status(404).json({ success: false, message: 'Access code not found' });
      }

      await accessLog.update({
        status: 'rejected',
        scanned_by: securityId,
        remark: reason
      });

      if (accessLog.user_id) {
        pushNotificationService.sendToUser(
          accessLog.user_id,
          'Guest Entry Denied',
          `${accessLog.guest_name || 'Guest'}'s entry was rejected`,
          { type: 'entry', code, status: 'rejected' }
        ).catch(err => logger.error('Push notification error:', err));
      } else if (accessLog.user?.phone) {
        notificationService.sendEntryNotification(
          accessLog.user.phone,
          accessLog.guest_name || 'Guest',
          code,
          'rejected'
        ).catch(err => logger.error('Notification error:', err));
      }

      return res.status(200).json({
        success: true,
        message: 'Access rejected',
        data: accessLog
      });
    } catch (error: any) {
      logger.error('Reject access error:', error);
      return res.status(500).json({ success: false, message: 'Failed to reject access' });
    }
  }
};
