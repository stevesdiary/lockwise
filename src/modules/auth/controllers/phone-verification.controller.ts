import { Request, Response } from 'express';
import phoneVerificationService from '../services/phone-verification.service';

export const phoneVerificationController = {
  async sendOTP(req: Request, res: Response) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ message: 'Phone number is required' });
      }

      await phoneVerificationService.sendOTP(phone);

      return res.status(200).json({ 
        message: 'OTP sent successfully',
        expiresIn: '10 minutes'
      });
    } catch (error: any) {
      const sanitizedError = error?.message?.replace(/[\r\n]/g, '') || 'Unknown error';
      console.error('Send OTP error:', sanitizedError);
      return res.status(500).json({ message: 'Failed to send OTP' });
    }
  },

  async verifyOTP(req: Request, res: Response) {
    try {
      const { phone, otp } = req.body;

      if (!phone || !otp) {
        return res.status(400).json({ message: 'Phone number and OTP are required' });
      }

      const isValid = await phoneVerificationService.verifyOTP(phone, otp);

      if (!isValid) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }

      return res.status(200).json({ 
        message: 'Phone verified successfully',
        verified: true
      });
    } catch (error: any) {
      const sanitizedError = error?.message?.replace(/[\r\n]/g, '') || 'Unknown error';
      console.error('Verify OTP error:', sanitizedError);
      return res.status(500).json({ message: 'Failed to verify OTP' });
    }
  }
};
