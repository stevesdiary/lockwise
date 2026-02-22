import { Request, Response } from 'express';
import { Notification } from '../models/notification.model';
import NotificationService from '../../communication/services/notification.service';
import EmailService from '../../communication/services/email.service';
import SMSService from '../../communication/services/sms.service';
import { AuthRequest } from '../../auth/middleware/auth.middleware';

export const notificationController = {
  async getUserNotifications(req: AuthRequest, res: Response) {
    try {
      const notifications = await Notification.findAll({
        where: { user_id: req.user!.id },
        order: [['created_at', 'DESC']]
      });
      
      res.json({
        status: 'success',
        data: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          timestamp: n.createdAt,
          read: n.is_read,
          data: n.data
        }))
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  async markAsRead(req: AuthRequest, res: Response) {
    try {
      await Notification.update(
        { is_read: true },
        { where: { id: req.params.id, user_id: req.user!.id } }
      );
      res.json({ status: 'success' });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      await Notification.update(
        { is_read: true },
        { where: { user_id: req.user!.id, is_read: false } }
      );
      res.json({ status: 'success' });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  async clearAll(req: AuthRequest, res: Response) {
    try {
      await Notification.destroy({ where: { user_id: req.user!.id } });
      res.json({ status: 'success' });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },
  async sendTestEmail(req: Request, res: Response) {
    try {
      const { email, name } = req.body;
      const success = await EmailService.sendWelcomeEmail(email, name);
      res.status(success ? 200 : 500).json({
        status: success ? 'success' : 'error',
        message: success ? 'Test email sent successfully' : 'Failed to send test email'
      });
    } catch (error: any) {
      res.status(500).json({ status: 'error', message: error.message });
    }
  },

  async sendTestSMS(req: Request, res: Response) {
    try {
      const { phone, name, code } = req.body;
      
      const success = await SMSService.sendVerificationSMS(phone, name, code);
      
      res.status(success ? 200 : 500).json({
        status: success ? 'success' : 'error',
        message: success ? 'Test SMS sent successfully' : 'Failed to send test SMS'
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  async getQueueStats(req: Request, res: Response) {
    try {
      const stats = await NotificationService.getQueueStats();
      
      res.status(200).json({
        status: 'success',
        data: stats
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  async sendBulkNotification(req: Request, res: Response) {
    try {
      const { recipients, type, template, data, priority } = req.body;
      
      const notifications = recipients.map((recipient: any) => 
        NotificationService.sendNotification({
          type,
          to: recipient.email || recipient.phone,
          template,
          data: { ...data, name: recipient.name },
          priority
        })
      );
      
      await Promise.all(notifications);
      
      res.status(200).json({
        status: 'success',
        message: `${notifications.length} notifications queued successfully`
      });
    } catch (error: any) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  },

  // async testEmailConnection(req: Request, res: Response) {
  //   try {
  //     const isConnected = await EmailService.testConnection();
      
  //     res.status(200).json({
  //       status: 'success',
  //       connected: isConnected,
  //       message: isConnected ? 'Email service connected' : 'Email service connection failed'
  //     });
  //   } catch (error: any) {
  //     res.status(500).json({
  //       status: 'error',
  //       message: error.message
  //     });
  //   }
  // }
};