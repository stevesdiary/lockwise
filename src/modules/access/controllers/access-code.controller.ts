import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../../auth/middleware/auth.middleware';
import accessCodeService from '../services/access-code.service';
import AccessLog from '../models/access-log.model';
import { User } from '../../auth/models/user.model';
import logger from '../../../shared/utils/logger';
import {
  formatAccessCodeMessage,
  buildGoogleMapsSearchUrl,
  buildGoogleMapsDirectionsUrl,
  coordsToString,
  getResidentFullAddress,
  getResidentUnitCoordinates,
} from '../../../shared/utils/address.util';
import { getOrCreateShortUrl, nullifyShortUrlForLog } from '../../../shared/utils/url-shortener.util';
import { Estate } from '../../estate/models/estate.model';
import { Gate } from '../../estate/models/gate.model';
import notificationService from '../../../shared/services/notification.service';
import { pushNotificationService } from '../../communication/services/push-notification.service';
import { UserRole } from '../../../shared/constants/permissions';

const buildNavUrl = (logId: string): string | null => {
  const base = process.env.WEB_PORTAL_URL?.replace(/\/$/, '');
  return base ? `${base}/nav/${logId}` : null;
};

const UNLIMITED_ACCESS_TYPES = ['domestic_staff', 'service', 'maintenance'];

export const accessCodeController = {
  async getAccessCodes(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      const userRole = (req.user!.role as string)?.toLowerCase() || '';
      const isManager = ['master', 'super_admin', 'admin', 'manager'].includes(userRole);

      const where: any = isManager && req.user?.estate_id
        ? { estate_id: req.user.estate_id }
        : { user_id: userId };

      const accessCodes = await AccessLog.findAll({
        where,
        include: isManager
          ? [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name'] }]
          : [],
        order: [['created_at', 'DESC']],
      });

      return res.status(200).json({
        success: true,
        data: accessCodes.map((code) => {
          const json = code.toJSON() as any;
          return { ...json, created_at: json.created_at ?? json.createdAt };
        }),
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

      if (!userId) return res.status(401).json({ message: 'Unauthorized' });

      if (req.user?.role === UserRole.SECURITY) {
        return res.status(403).json({
          success: false,
          message: 'Security personnel are not allowed to create access codes',
        });
      }

      if (!estateId) {
        return res.status(403).json({
          success: false,
          message:
            "You haven't joined an estate yet. Search for your estate using its estate code, complete your profile setup, and get approved by your estate manager before generating access codes.",
        });
      }

      const { visitor_name, valid_until, valid_from, visitor_phone, access_type, is_multi_entry, max_entries, access_direction, headshot_url } = req.body;

      if (!visitor_name || !valid_until) {
        return res.status(400).json({ message: 'visitor_name and valid_until are required' });
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const validFromDate = valid_from ? new Date(valid_from) : new Date();
      const validUntilDate = new Date(valid_until);

      const estate = await Estate.findByPk(estateId, { attributes: ['name', 'city', 'state'] });
      const estateAddress = [estate?.name, estate?.city, estate?.state].filter(Boolean).join(', ');

      const isUnlimited = UNLIMITED_ACCESS_TYPES.includes(access_type);

      const accessCode = await accessCodeService.generateCode({
        user_id: userId,
        estate_id: estateId,
        code,
        guest_name: visitor_name,
        guest_phone: visitor_phone,
        access_type,
        valid_from: validFromDate,
        valid_until: validUntilDate,
        is_multi_entry: isUnlimited ? true : (is_multi_entry || false),
        max_entries: isUnlimited ? null : (max_entries ?? (is_multi_entry ? null : undefined)),
        access_direction: access_direction ?? 'entry',
        headshot_url: headshot_url ?? null,
      });

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
          navUrl: buildNavUrl(codeJson.id),
          shareMessage,
        },
      });
    } catch (error: any) {
      logger.error('Generate access code error:', error);
      return res.status(500).json({ success: false, message: 'Failed to generate access code', error: error.message });
    }
  },

  async validateCode(req: AuthRequest, res: Response) {
    try {
      const { code, scan_type } = req.body;
      if (!code) return res.status(400).json({ message: 'Code is required' });

      const accessLog = await AccessLog.findOne({
        where: { access_code: code, status: 'active' },
        include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'phone'] }],
      });

      if (!accessLog) {
        return res.status(404).json({ success: false, message: 'Invalid or expired access code' });
      }

      if (req.user?.estate_id && (accessLog as any).estate_id !== req.user.estate_id) {
        return res.status(403).json({ success: false, message: 'This access code was not generated for your estate.' });
      }

      if (accessLog.valid_until && new Date() > new Date(accessLog.valid_until)) {
        return res.status(400).json({ success: false, message: 'Access code expired' });
      }

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
        data: { ...((accessLog as any).toJSON?.() ?? accessLog), remaining_entries: remainingEntries },
      });
    } catch (error: any) {
      logger.error('Validate access code error:', error);
      return res.status(500).json({ success: false, message: 'Failed to validate access code' });
    }
  },

  async approveAccess(req: AuthRequest, res: Response) {
    try {
      const { code, gate_id } = req.body;
      const securityId = req.user?.id;

      if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

      if (req.user?.role === UserRole.SECURITY) {
        const securityUser = await User.findByPk(securityId, { attributes: ['status'] });
        if (!securityUser || (securityUser as any).status !== 'active') {
          return res.status(403).json({ success: false, message: 'Your account is inactive. Contact your estate manager.' });
        }
      }

      const { accessLog, isExitScan } = await accessCodeService.approveCode(
        code,
        securityId!,
        gate_id,
        req.user?.estate_id
      );

      const guestName = accessLog.guest_name || 'Guest';
      const notifTitle = isExitScan ? 'Guest Exit' : 'Guest Entry';
      const notifBody = isExitScan
        ? `${guestName} has exited the estate`
        : `${guestName} has entered the estate`;
      const eventType = isExitScan ? 'exit' : 'entry';

      if (accessLog.user_id) {
        pushNotificationService
          .sendToUser(accessLog.user_id, notifTitle, notifBody, { type: eventType, code, status: 'approved' })
          .catch((err) => logger.error('Push notification error:', err));
      } else if ((accessLog as any).user?.phone) {
        notificationService
          .sendEntryNotification((accessLog as any).user.phone, guestName, code, 'approved')
          .catch((err) => logger.error('Notification error:', err));
      }

      return res.status(200).json({
        success: true,
        message: isExitScan ? 'Exit approved' : 'Access approved',
        data: accessLog,
      });
    } catch (error: any) {
      if (error.message === 'Maximum entries reached for this access code') {
        return res.status(400).json({ success: false, message: error.message });
      }
      logger.error('Approve access error:', error);
      return res.status(500).json({ success: false, message: 'Failed to approve access' });
    }
  },

  async rejectAccess(req: AuthRequest, res: Response) {
    try {
      const { code, reason, gate_id } = req.body;
      const securityId = req.user?.id;

      if (!code) return res.status(400).json({ success: false, message: 'Code is required' });

      if (req.user?.role === UserRole.SECURITY) {
        const securityUser = await User.findByPk(securityId, { attributes: ['status'] });
        if (!securityUser || (securityUser as any).status !== 'active') {
          return res.status(403).json({ success: false, message: 'Your account is inactive. Contact your estate manager.' });
        }
      }

      const accessLog = await accessCodeService.rejectCode(
        code,
        securityId!,
        reason,
        gate_id,
        req.user?.estate_id
      );

      const guestName = accessLog.guest_name || 'Guest';
      const direction = (accessLog as any).access_direction as 'entry' | 'exit' | 'both';
      const isExitReject = direction === 'exit';

      if (accessLog.user_id) {
        pushNotificationService
          .sendToUser(
            accessLog.user_id,
            isExitReject ? 'Guest Exit Denied' : 'Guest Entry Denied',
            isExitReject ? `${guestName}'s exit was rejected` : `${guestName}'s entry was rejected`,
            { type: isExitReject ? 'exit' : 'entry', code, status: 'rejected' }
          )
          .catch((err) => logger.error('Push notification error:', err));
      } else if ((accessLog as any).user?.phone) {
        notificationService
          .sendEntryNotification((accessLog as any).user.phone, guestName, code, 'rejected')
          .catch((err) => logger.error('Notification error:', err));
      }

      return res.status(200).json({ success: true, message: 'Access rejected', data: accessLog });
    } catch (error: any) {
      logger.error('Reject access error:', error);
      return res.status(500).json({ success: false, message: 'Failed to reject access' });
    }
  },

  async revokeCode(req: AuthRequest, res: Response) {
    try {
      const code = Array.isArray(req.params.code) ? req.params.code[0] : req.params.code;
      const userId = req.user?.id;

      const accessLog = await accessCodeService.revokeCode(code, userId!);

      nullifyShortUrlForLog(accessLog.id).catch(() => {});

      return res.status(200).json({ success: true, message: 'Access code revoked', data: accessLog });
    } catch (error: any) {
      logger.error('Revoke access code error:', error);
      return res.status(error.message.includes('not found') ? 404 : 500).json({
        success: false,
        message: error.message || 'Failed to revoke access code',
      });
    }
  },

  async getShareUrl(req: AuthRequest, res: Response) {
    try {
      const logId = req.params.logId as string;
      const userId = req.user?.id;

      const accessLog = await AccessLog.findOne({
        where: { id: logId, user_id: userId, status: { [Op.in]: ['active', 'pending'] } },
      });

      if (!accessLog) {
        return res.status(404).json({ success: false, message: 'Access code not found or already revoked' });
      }

      const estate = await Estate.findByPk(accessLog.estate_id, { attributes: ['name', 'city', 'state'] });
      const estateAddress = [estate?.name, estate?.city, estate?.state].filter(Boolean).join(', ');

      const longUrl = buildNavUrl(logId) || buildGoogleMapsSearchUrl(estateAddress);
      let shortUrl = longUrl;
      try {
        shortUrl = await getOrCreateShortUrl(longUrl, logId);
      } catch {
        shortUrl = longUrl;
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

      const accessLog = await AccessLog.findOne({ where: { access_code: code, user_id: userId } });
      if (!accessLog) {
        return res.status(404).json({ success: false, message: 'Access code not found' });
      }

      await accessLog.update({ status: 'used' });

      if (accessLog.user_id) {
        pushNotificationService
          .sendToUser(accessLog.user_id, 'Guest Check-in', `${accessLog.guest_name || 'Guest'} has checked-in`, {
            type: 'checkin',
            code,
          })
          .catch((err) => logger.error('Push notification error:', err));
      }

      return res.status(200).json({ success: true, message: 'Access confirmed', data: accessLog });
    } catch (error: any) {
      logger.error('Confirm access error:', error);
      return res.status(500).json({ success: false, message: 'Failed to confirm access' });
    }
  },

  async getGuestNav(req: AuthRequest, res: Response) {
    try {
      const token = Array.isArray(req.params.token) ? req.params.token[0] : req.params.token;

      const accessLog = await AccessLog.findByPk(token);
      if (!accessLog) {
        return res.status(404).json({
          success: false,
          message: 'This visit pass could not be found. Please ask your host to resend the link.',
        });
      }

      const estate = await Estate.findByPk(accessLog.estate_id, {
        attributes: ['name', 'city', 'state', 'location_details'],
      });
      const estateName = estate?.name || null;

      const now = new Date();
      const hasEntered =
        (accessLog as any).entry_time != null ||
        accessLog.status === 'approved' ||
        accessLog.status === 'used';

      let status = accessLog.status;
      if (!hasEntered && status === 'active' && accessLog.valid_until && now > new Date(accessLog.valid_until)) {
        status = 'expired';
      }

      const terminal = ['expired', 'revoked', 'rejected'].includes(status);
      const revealed = hasEntered && !terminal;

      let gate: { label: string; maps_url: string } | null = null;
      if (!terminal) {
        const mainGate = await Gate.findOne({
          where: { estate_id: accessLog.estate_id, gate_type: 'main', is_active: true },
        });
        const estateAddress = [estate?.name, estate?.city, estate?.state].filter(Boolean).join(', ');
        const gateDest =
          coordsToString(mainGate?.coordinates) ||
          coordsToString(estate?.location_details?.coordinates) ||
          estateAddress;
        if (gateDest) {
          gate = {
            label: estateName ? `${estateName} — main gate` : 'Estate gate',
            maps_url: buildGoogleMapsDirectionsUrl(gateDest),
          };
        }
      }

      let residence: { label: string; maps_url: string } | null = null;
      if (revealed && accessLog.user_id) {
        const [coords, addressText] = await Promise.all([
          getResidentUnitCoordinates(accessLog.user_id),
          getResidentFullAddress(accessLog.user_id),
        ]);
        const residenceDest = coordsToString(coords) || addressText;
        if (residenceDest) {
          residence = {
            label: addressText || 'Residence',
            maps_url: buildGoogleMapsDirectionsUrl(residenceDest),
          };
        }
      }

      return res.status(200).json({
        success: true,
        data: {
          guest_name: accessLog.guest_name || 'Guest',
          estate_name: estateName,
          code: accessLog.access_code || '',
          status,
          valid_from: accessLog.valid_from ?? null,
          valid_until: accessLog.valid_until ?? null,
          revealed,
          gate,
          residence,
        },
      });
    } catch (error: any) {
      logger.error('Guest nav lookup error:', error);
      return res.status(500).json({ success: false, message: 'Failed to load visit pass' });
    }
  },
};
