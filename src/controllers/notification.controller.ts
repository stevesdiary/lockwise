import { Request, Response } from 'express';
import { handleControllerError } from '../middlewares/error.handler';
import pushNotificationService from '../services/push.notification.service';

class NotificationController {
  async subscribe(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { subscription } = req.body;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      await pushNotificationService.subscribeToPush(userId, subscription);

      return res.status(200).json({
        status: 'success',
        message: 'Push notification subscription saved'
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const notifications = await pushNotificationService.getUserNotifications(userId, limit);

      return res.status(200).json({
        status: 'success',
        data: notifications
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { notificationId } = req.params;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const updated = await pushNotificationService.markAsRead(notificationId, userId);

      if (!updated) {
        return res.status(404).json({
          status: 'fail',
          message: 'Notification not found'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Notification marked as read'
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const updatedCount = await pushNotificationService.markAllAsRead(userId);

      return res.status(200).json({
        status: 'success',
        message: `${updatedCount} notifications marked as read`
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async sendTestNotification(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { title, message } = req.body;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const notification = await pushNotificationService.sendToUser(userId, {
        title: title || 'Test Notification',
        message: message || 'This is a test notification',
        type: 'system_alert'
      });

      return res.status(200).json({
        status: 'success',
        data: notification
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new NotificationController();