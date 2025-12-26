import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { db } from '../core/database.optimized';
import notificationService from '../services/notification.service';
import { pushNotificationService } from '../services/push-notification.service';
import { deepLinkService } from '../services/deep-link.service';

export const passwordResetController = {
  async requestReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      const user = await db.oneOrNone('SELECT id, email, first_name FROM users WHERE email = $1', [email]);
      
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ message: 'If email exists, reset link sent' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await db.none(
        'UPDATE users SET reset_token = $1, reset_expires = $2 WHERE id = $3',
        [resetToken, resetExpires, user.id]
      );

      await notificationService.sendNotification({
        type: 'email',
        to: user.email,
        template: 'passwordReset',
        data: { name: user.first_name, resetToken },
        priority: 'high'
      });
      
      // Send push notification if user has mobile devices
      await pushNotificationService.sendToUser(
        user.id, 
        'Password Reset', 
        'A password reset was requested for your account',
        { type: 'password_reset', deepLink: deepLinkService.passwordReset(resetToken) }
      );

      res.json({ message: 'If email exists, reset link sent' });
    } catch (error) {
      res.status(500).json({ error: 'Reset request failed' });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      const user = await db.oneOrNone(
        'SELECT id FROM users WHERE reset_token = $1 AND reset_expires > NOW()',
        [token]
      );

      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      await db.none(
        'UPDATE users SET password = $1, reset_token = NULL, reset_expires = NULL WHERE id = $2',
        [hashedPassword, user.id]
      );

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      res.status(500).json({ error: 'Password reset failed' });
    }
  }
};