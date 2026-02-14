import { Response } from 'express';
import { pushNotificationService } from '../../communication/services/push-notification.service';
import { offlineSyncService } from '../services/offline-sync.service';
import { deepLinkService } from '../services/deep-link.service';
import { AuthRequest } from '../../auth/middleware/auth.middleware';
import UserDevice from '../models/user-device.model';

export const mobileController = {
  async registerDevice(req: AuthRequest, res: Response) {
    try {
      const { deviceId, fcmToken, platform, appVersion } = req.body;

      await UserDevice.upsert({
        user_id: req.user!.id,
        device_id: deviceId,
        fcm_token: fcmToken,
        platform,
        app_version: appVersion,
      });

      res.json({ message: 'Device registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Device registration failed' });
    }
  },

  async syncData(req: AuthRequest, res: Response) {
    try {
      const { lastSync } = req.query;
      
      const syncData = await offlineSyncService.getUserSyncData(
        req.user!.id, 
        lastSync as string
      );

      res.json(syncData);
    } catch (error) {
      res.status(500).json({ error: 'Sync failed' });
    }
  },

  async uploadPendingChanges(req: AuthRequest, res: Response) {
    try {
      const { changes } = req.body;

      const results = [];
      for (const change of changes) {
        const syncId = await offlineSyncService.storePendingSync(
          req.user!.id, 
          change.action, 
          change.data
        );
        results.push({ syncId, action: change.action });
      }

      const processed = await offlineSyncService.processPendingSync(req.user!.id);

      res.json({ uploaded: results, processed });
    } catch (error) {
      res.status(500).json({ error: 'Upload failed' });
    }
  },

  async generateDeepLink(req: AuthRequest, res: Response) {
    try {
      const { type, params } = req.body;

      let link: string;
      switch (type) {
        case 'access_code':
          link = deepLinkService.accessCode(params.codeId, params.code);
          break;
        case 'guest_invite':
          link = deepLinkService.guestInvite(params.inviteId);
          break;
        case 'payment':
          link = deepLinkService.paymentLink(params.paymentId);
          break;
        default:
          return res.status(400).json({ error: 'Invalid link type' });
      }

      res.json({ link });
    } catch (error) {
      res.status(500).json({ error: 'Link generation failed' });
    }
  },

  async testPushNotification(req: AuthRequest, res: Response) {
    try {
      const { title, body, data } = req.body;

      await pushNotificationService.sendToUser(req.user!.id, title, body, data);

      res.json({ message: 'Push notification sent' });
    } catch (error) {
      res.status(500).json({ error: 'Push notification failed' });
    }
  }
};