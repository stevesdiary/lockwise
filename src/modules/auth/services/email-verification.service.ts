import { User } from '../models/user.model';
import emailService from '../../communication/services/email.service';
import jwt from 'jsonwebtoken';

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

      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await user.update({
        verification_code: code,
        verification_expires: expiresAt
      });

      await emailService.sendVerificationEmail(email, user.first_name, code);
      
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

      if (!user.verification_code || !user.verification_expires) {
        return { success: false, message: 'No verification code found' };
      }

      if (new Date() > user.verification_expires) {
        return { success: false, message: 'Verification code expired' };
      }

      if (user.verification_code !== code) {
        return { success: false, message: 'Invalid verification code' };
      }

      await user.update({
        verified: true,
        status: 'active',
        verification_code: null,
        verification_expires: null
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, user_type: user.user_type },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      const { password, verification_code, verification_expires, reset_token, reset_expires, ...userWithoutSensitive } = user.toJSON();

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
