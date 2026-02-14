import crypto from 'crypto';
import { Estate } from '../models/estate.model';

interface InvitationToken {
  estate_code: string;
  estate_id: string;
  expires_at: number;
}

class EstateInvitationService {
  private encryptToken(data: InvitationToken): string {
    const payload = JSON.stringify(data);
    const encrypted = Buffer.from(payload).toString('base64url');
    return encrypted;
  }

  private decryptToken(token: string): InvitationToken | null {
    try {
      const payload = Buffer.from(token, 'base64url').toString('utf-8');
      return JSON.parse(payload);
    } catch (error) {
      return null;
    }
  }

  async generateInvitationLink(estateId: string): Promise<{ success: boolean; link?: string; message: string }> {
    try {
      const estate = await Estate.findByPk(estateId);
      if (!estate) {
        return { success: false, message: 'Estate not found' };
      }

      const tokenData: InvitationToken = {
        estate_code: estate.estate_code,
        estate_id: estate.estate_id,
        expires_at: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
      };

      const token = this.encryptToken(tokenData);
      const baseUrl = process.env.MOBILE_APP_URL || 'lockwise://';
      const link = `${baseUrl}register?invite=${token}`;

      return {
        success: true,
        link,
        message: 'Invitation link generated successfully',
      };
    } catch (error: any) {
      console.error('Generate invitation link error:', error);
      return { success: false, message: 'Failed to generate invitation link' };
    }
  }

  async validateInvitationToken(token: string): Promise<{ valid: boolean; estate_code?: string; message: string }> {
    try {
      const data = this.decryptToken(token);
      if (!data) {
        return { valid: false, message: 'Invalid invitation token' };
      }

      if (Date.now() > data.expires_at) {
        return { valid: false, message: 'Invitation link has expired' };
      }

      const estate = await Estate.findOne({ where: { estate_code: data.estate_code } as any });
      if (!estate) {
        return { valid: false, message: 'Estate not found' };
      }

      return {
        valid: true,
        estate_code: data.estate_code,
        message: 'Valid invitation token',
      };
    } catch (error: any) {
      console.error('Validate invitation token error:', error);
      return { valid: false, message: 'Invalid invitation token' };
    }
  }
}

export default new EstateInvitationService();
