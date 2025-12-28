import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { User } from '../models/user.model';
import notificationService from './notification.service';
import { pushNotificationService } from './push-notification.service';
import { deepLinkService } from './deep-link.service';

export const passwordResetService = {
  async requestReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findOne({ 
        where: { email },
        attributes: ['id', 'email', 'first_name']
      });
      
      // Always return success to prevent email enumeration
      if (!user) {
        return { success: true, message: 'If email exists, reset link sent' };
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      await user.update({
        reset_token: resetToken,
        reset_expires: resetExpires
      });

      await notificationService.sendNotification({
        type: 'email',
        to: user.email,
        template: 'passwordReset',
        data: { name: user.first_name, resetToken },
        priority: 'high'
      });
      
      await pushNotificationService.sendToUser(
        user.id, 
        'Password Reset', 
        'A password reset was requested for your account',
        { type: 'password_reset', deepLink: deepLinkService.passwordReset(resetToken) }
      );

      return { success: true, message: 'If email exists, reset link sent' };
    } catch (error) {
      throw new Error('Reset request failed');
    }
  },

  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findOne({
        where: { reset_token: token },
        attributes: ['id', 'reset_expires']
      });

      if (!user || !user.reset_expires || user.reset_expires < new Date()) {
        return { success: false, message: 'Invalid or expired token' };
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      await user.update({
        password: hashedPassword,
        reset_token: null,
        reset_expires: null
      });

      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      throw new Error('Password reset failed');
    }
  }
};