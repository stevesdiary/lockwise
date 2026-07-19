import { Response } from 'express';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
import UserDevice from '../models/user-device.model';

export const deviceController = {
  async registerDevice(req: AuthRequest, res: Response) {
    try {
      const { fcmToken, deviceId, platform, appVersion } = req.body;
      const userId = req.user!.id;

      await UserDevice.upsert({
        user_id: userId,
        fcm_token: fcmToken,
        device_type: platform || 'mobile',
        device_model: deviceId || null,
        app_version: appVersion || null,
        is_active: true,
        last_used: new Date()
      });

      res.json({ status: 'success', message: 'Device registered successfully' });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  async unregisterDevice(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      await UserDevice.destroy({ where: { user_id: userId } });
      res.json({ status: 'success', message: 'Device unregistered successfully' });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  }
};
