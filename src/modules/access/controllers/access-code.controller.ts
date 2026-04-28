import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../../auth/middleware/auth.middleware';
import sequelize from '../../../shared/core/database';
import accessCodeService from '../services/access-code.service';
import AccessLog from '../models/access-log.model';
import { User } from '../../auth/models/user.model';
import logger from '../../../shared/utils/logger';
import { formatAccessCodeMessage, buildGoogleMapsSearchUrl } from '../../../shared/utils/address.util';
import { getOrCreateShortUrl, nullifyShortUrlForLog } from '../../../shared/utils/url-shortener.util';
import { Estate } from '../../estate/models/estate.model';
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
      const { visitor_name, valid_until, valid_from, visitor_phone, access_type, is_multi_entry, max_entries, access_direction, headshot_url } = req.body;

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
        return res.status(403).json({
          success: false,
          message: "You haven't joined an estate yet. Search for your estate using its estate code, complete your profile setup, and get approved by your estate manager before generating access codes.",
        });
      }

      if (!visitor_name || !valid_until) {
        return res.status(400).json({ message: 'visitor_name and valid_until are required' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const validFromDate = valid_from ? new Date(valid_from) : new Date();
      const validUntilDate = new Date(valid_until);
      
      // Use estate-level address (not resident unit) as the destination shown to guests
      const estate = await Estate.findByPk(estateId, { attributes: ['name', 'city', 'state'] });
      const estateAddress = [estate?.name, estate?.city, estate?.state].filter(Boolean).join(', ');

      const unlimitedTypes = ['domestic_staff', 'service', 'maintenance'];
      const shouldAllowUnlimited = unlimitedTypes.includes(access_type);

      const accessCode = await accessCodeService.generateCode({
        user_id: userId,
        estate_id: estateId,
        code,
        guest_name: visitor_name,
        guest_phone: visitor_phone,
        access_type,
        valid_from: validFromDate,
        valid_until: validUntilDate,
        is_multi_entry: shouldAllowUnlimited ? true : (is_multi_entry || false),
        max_entries: shouldAllowUnlimited ? null : (max_entries ?? (is_multi_entry ? null : undefined)),
        access_direction: access_direction ?? 'entry',
        headshot_url: headshot_url ?? null,
      });

      // Share message without maps URL — URL is generated lazily when user taps Share
      const shareMessage = formatAccessCodeMessage(
        visitor_name,
        code,
        estateAddress,
        validFromDate,
        validUntilDate
      );

      const codeJson = accessCode.toJSON() as any;
      return res.status(201).json({
        success: true,
        message: 'Access code generated',
        data: {
          ...codeJson,
          created_at: codeJson.created_at ?? codeJson.createdAt,
          accessLogId: codeJson.id,
          estateAddress,
          destinationAddress: estateAddress || null,
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
      const { code, scan_type } = req.body;

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

      // 'exit'-only codes cannot be used for entry
      const direction = (accessLog as any).access_direction || 'entry';
      if (scan_type === 'entry' && direction === 'exit') {
        return res.status(403).json({ success: false, message: 'This code is for exit only and cannot be used for entry' });
      }

      const maxEntries = (accessLog as any).max_entries as number | null;
      const usedEntries = (accessLog as any).used_entries as number ?? 0;
      const isMultiEntry = Boolean((accessLog as any).is_multi_entry);
      const remainingEntries = isMultiEntry && maxEntries !== null ? Math.max(0, maxEntries - usedEntries) : null;

      return res.status(200).json({
        success: true,
        message: 'Access code validated',
        data: {
          ...((accessLog as any).toJSON?.() ?? accessLog),
          remaining_entries: remainingEntries,
        },
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

      const direction = (accessLog as any).access_direction as 'entry' | 'exit' | 'both';
      const now = new Date();

      // For 'both' codes: first scan = entry (entry_time not set yet), second scan = exit
      const isExitScan =
        direction === 'exit' ||
        (direction === 'both' && (accessLog as any).entry_time != null);

      const timeField = isExitScan ? 'exit_time' : 'entry_time';
      const eventType = isExitScan ? 'exit' : 'entry';

      if ((accessLog as any).is_multi_entry) {
        // Multi-entry: atomically increment used_entries; only mark 'used' when all entries are exhausted
        await sequelize.transaction(async (t) => {
          await accessLog.increment('used_entries', { transaction: t });
          await accessLog.reload({ transaction: t });

          const maxEntries = (accessLog as any).max_entries as number | null;
          const usedEntries = (accessLog as any).used_entries as number;

          if (maxEntries !== null && maxEntries !== undefined && usedEntries > maxEntries) {
            await accessLog.decrement('used_entries', { transaction: t });
            throw new Error('Maximum entries reached for this access code');
          }

          const isExhausted = maxEntries !== null && maxEntries !== undefined && usedEntries >= maxEntries;

          await accessLog.update({
            status: isExhausted ? 'used' : 'active',
            [timeField]: now,
            scanned_by: securityId,
          }, { transaction: t });
        });
      } else {
        await accessLog.update({
          status: 'approved',
          [timeField]: now,
          scanned_by: securityId,
        });
      }

      const guestName = accessLog.guest_name || 'Guest';
      const notifTitle = isExitScan ? 'Guest Exit' : 'Guest Entry';
      const notifBody = isExitScan
        ? `${guestName} has exited the estate`
        : `${guestName} has entered the estate`;

      if (accessLog.user_id) {
        pushNotificationService.sendToUser(
          accessLog.user_id,
          notifTitle,
          notifBody,
          { type: eventType, code, status: 'approved' }
        ).catch(err => logger.error('Push notification error:', err));
      } else if (accessLog.user?.phone) {
        notificationService.sendEntryNotification(
          accessLog.user.phone,
          guestName,
          code,
          'approved'
        ).catch(err => logger.error('Notification error:', err));
      }

      return res.status(200).json({
        success: true,
        message: isExitScan ? 'Exit approved' : 'Access approved',
        data: accessLog
      });
    } catch (error: any) {
      if (error.message === 'Maximum entries reached for this access code') {
        return res.status(400).json({ success: false, message: error.message });
      }
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

      // Nullify the shared Maps short URL so the link in the guest's message stops working
      nullifyShortUrlForLog(accessLog.id).catch(() => {});

      return res.status(200).json({ success: true, message: 'Access code revoked', data: accessLog });
    } catch (error: any) {
      logger.error('Revoke access code error:', error);
      return res.status(500).json({ success: false, message: 'Failed to revoke access code' });
    }
  },

  async getShareUrl(req: AuthRequest, res: Response) {
    try {
      const logId = req.params.logId as string;
      const userId = req.user?.id;

      const accessLog = await AccessLog.findOne({
        where: { id: logId, user_id: userId, status: { [Op.in]: ['active', 'pending'] } }
      });

      if (!accessLog) {
        return res.status(404).json({ success: false, message: 'Access code not found or already revoked' });
      }

      const estate = await Estate.findByPk(accessLog.estate_id, { attributes: ['name', 'city', 'state'] });
      const estateAddress = [estate?.name, estate?.city, estate?.state].filter(Boolean).join(', ');
      const longMapsUrl = buildGoogleMapsSearchUrl(estateAddress);

      let shortUrl = longMapsUrl;
      try {
        shortUrl = await getOrCreateShortUrl(longMapsUrl, logId);
      } catch {
        shortUrl = longMapsUrl;
      }

      const shareMessage = formatAccessCodeMessage(
        accessLog.guest_name || 'Guest',
        accessLog.access_code || '',
        estateAddress,
        accessLog.valid_from!,
        accessLog.valid_until!,
        shortUrl
      );

      return res.status(200).json({ success: true, data: { shortUrl, shareMessage } });
    } catch (error: any) {
      logger.error('Get share URL error:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate share link' });
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

      const guestName = accessLog.guest_name || 'Guest';
      const rejDirection = (accessLog as any).access_direction as 'entry' | 'exit' | 'both';
      const isExitReject = rejDirection === 'exit';
      const rejEventType = isExitReject ? 'exit' : 'entry';
      const rejBody = isExitReject
        ? `${guestName}'s exit was rejected`
        : `${guestName}'s entry was rejected`;

      if (accessLog.user_id) {
        pushNotificationService.sendToUser(
          accessLog.user_id,
          isExitReject ? 'Guest Exit Denied' : 'Guest Entry Denied',
          rejBody,
          { type: rejEventType, code, status: 'rejected' }
        ).catch(err => logger.error('Push notification error:', err));
      } else if (accessLog.user?.phone) {
        notificationService.sendEntryNotification(
          accessLog.user.phone,
          guestName,
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
