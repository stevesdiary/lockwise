import { Estate } from '../models/estate.model';
import emailService from '../../communication/services/email.service';

interface InvitationToken {
  estate_code: string;
  estate_id: string;
  expires_at: number;
  invited_email?: string;
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

  async generateInvitationLink(
    estateId: string,
    invitedEmail?: string
  ): Promise<{ success: boolean; link?: string; message: string }> {
    try {
      const estate = await Estate.findByPk(estateId);
      if (!estate) {
        return { success: false, message: 'Estate not found' };
      }

      const tokenData: InvitationToken = {
        estate_code: estate.estate_code,
        estate_id: estate.estate_id,
        expires_at: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        invited_email: invitedEmail,
      };

      const token = this.encryptToken(tokenData);
      const baseUrl = process.env.MOBILE_APP_URL || 'lockwise://register';
      const separator = baseUrl.includes('?') ? '&' : '?';
      const link = `${baseUrl}${separator}invite=${token}`;

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

  async validateInvitationToken(token: string): Promise<{
    valid: boolean;
    estate_code?: string;
    estate_id?: string;
    invited_email?: string;
    message: string;
  }> {
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
        estate_id: data.estate_id,
        invited_email: data.invited_email,
        message: 'Valid invitation token',
      };
    } catch (error: any) {
      console.error('Validate invitation token error:', error);
      return { valid: false, message: 'Invalid invitation token' };
    }
  }

  async sendInvitationEmails(
    estateId: string,
    emails: string[],
    inviterName?: string
  ): Promise<{ success: boolean; message: string; invited: number; failed: number; links: string[] }> {
    const estate = await Estate.findByPk(estateId);
    if (!estate) {
      return { success: false, message: 'Estate not found', invited: 0, failed: emails.length, links: [] };
    }

    const cleanEmails = [...new Set(emails.map((email) => email.trim().toLowerCase()).filter(Boolean))];
    let invited = 0;
    let failed = 0;
    const links: string[] = [];

    for (const email of cleanEmails) {
      try {
        const linkResult = await this.generateInvitationLink(estateId, email);
        if (!linkResult.success || !linkResult.link) {
          failed += 1;
          continue;
        }

        const sent = await emailService.sendEstateInvitationEmail(email, {
          estate_name: estate.name,
          invitation_link: linkResult.link,
          inviter_name: inviterName || 'Estate Manager',
        });

        if (sent) {
          invited += 1;
          links.push(linkResult.link);
        } else {
          failed += 1;
        }
      } catch (error) {
        failed += 1;
      }
    }

    return {
      success: invited > 0,
      message: invited > 0 ? 'Invitation emails processed' : 'No invitation emails were sent',
      invited,
      failed,
      links,
    };
  }
}

export default new EstateInvitationService();
