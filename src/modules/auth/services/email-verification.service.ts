import { User } from '../models/user.model';
import { Estate } from '../../estate/models/estate.model';
import emailService from '../../communication/services/email.service';
import { formatDisplayName } from '../../../shared/utils/user.util';
import jwt from 'jsonwebtoken';
import { saveToRedis, getFromRedis, deleteFromRedis } from '../../../shared/core/redis';

class EmailVerificationService {
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendVerificationCode(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await User.findOne({ where: { email } });
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.verified) {
        return { success: false, message: 'Email already verified' };
      }

      const rateLimitKey = `email_rate_limit:${email}`;
      const existingRateLimit = await getFromRedis<string>(rateLimitKey);
      
      if (existingRateLimit) {
        return { success: false, message: 'Please wait before requesting another code' };
      }

      const code = this.generateCode();
      const redisKey = `email_verification:${email}`;
      
      await saveToRedis(redisKey, code, 600); // 10 minutes
      await saveToRedis(rateLimitKey, '1', 60); // 1 minute rate limit
      await emailService.sendVerificationEmail(email, formatDisplayName(user), code);
      
      return { success: true, message: 'Verification code sent' };
    } catch (error: any) {
      console.error('Send verification code error:', error);
      return { success: false, message: 'Failed to send verification code' };
    }
  }

  async verifyCode(email: string, code: string): Promise<{ success: boolean; message: string; data?: { user: any; token: string } }> {
    try {
      const user = await User.findOne({ where: { email }, include: ['role'] });

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (user.verified) {
        return { success: false, message: 'Email already verified' };
      }

      const redisKey = `email_verification:${email}`;
      const storedCode = await getFromRedis<string>(redisKey);

      if (!storedCode) {
        return { success: false, message: 'Verification code expired or not found' };
      }

      if (String(storedCode) !== code) {
        return { success: false, message: 'Invalid verification code' };
      }

      await deleteFromRedis(redisKey);

      // Users with an estate_id stay 'pending' — they need manager approval
      // Users without an estate go straight to 'active'
      const newStatus = (user as any).estate_id ? 'pending' : 'active';
      await user.update({
        verified: true,
        status: newStatus
      });

      const estateId = (user as any).estate_id;
      (estateId
        ? Estate.findByPk(estateId).then((estate) =>
            emailService.sendWelcomeEmail(user.email, formatDisplayName(user), estate?.name ?? undefined)
          )
        : emailService.sendWelcomeEmail(user.email, formatDisplayName(user))
      ).catch(() => {});

      const token = jwt.sign(
        { id: user.id, email: user.email, user_type: user.user_type },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      const { password, reset_token, reset_expires, ...userWithoutSensitive } = user.toJSON();

      return { 
        success: true, 
        message: 'Email verified successfully',
        data: { user: userWithoutSensitive, token }
      };
    } catch (error: any) {
      console.error('Verify code error:', error);
      return { success: false, message: 'Verification failed' };
    }
  }
}

export default new EmailVerificationService();
