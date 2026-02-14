import { Request, Response } from 'express';
import emailVerificationService from '../services/email-verification.service';

export const emailVerificationController = {
  async sendCode(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const result = await emailVerificationService.sendVerificationCode(email);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      const sanitizedError = error?.message?.replace(/[\r\n]/g, '') || 'Unknown error';
      console.error('Send verification code error:', sanitizedError);
      return res.status(500).json({ message: 'Failed to send verification code' });
    }
  },

  async verifyCode(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ message: 'Email and code are required' });
      }

      const result = await emailVerificationService.verifyCode(email, code);

      return res.status(result.success ? 200 : 400).json(result);
    } catch (error: any) {
      const sanitizedError = error?.message?.replace(/[\r\n]/g, '') || 'Unknown error';
      console.error('Verify code error:', sanitizedError);
      return res.status(500).json({ message: 'Verification failed' });
    }
  }
};
