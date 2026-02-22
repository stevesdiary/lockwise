import { Request, Response } from 'express';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';
import deviceService from '../services/device.service';

async function registerDevice(req: Request, res: Response) {
  try {
    const user_id = req.user.id;
    const { fcm_token, device_type, device_model, app_version } = req.body;

    if (!fcm_token) {
      return res.status(400).json({
        status: 'error',
        message: 'FCM token is required'
      });
    }

    await deviceService.registerDevice({
      user_id,
      fcm_token,
      device_type,
      device_model,
      app_version
    });

    return res.status(201).json({
      status: 'success',
      message: 'Device registered successfully'
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
}

async function updateToken(req: Request, res: Response) {
  try {
    const user_id = req.user.id;
    const { fcm_token } = req.body;

    if (!fcm_token) {
      return res.status(400).json({
        status: 'error',
        message: 'FCM token is required'
      });
    }

    await deviceService.updateToken(user_id, fcm_token);

    return res.status(200).json({
      status: 'success',
      message: 'Token updated successfully'
    });
  } catch (error) {
    return handleControllerError(error, res);
  }
}

export { registerDevice, updateToken };