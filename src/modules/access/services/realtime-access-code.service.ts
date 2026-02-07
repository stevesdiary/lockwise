import { webSocketService } from '../../../shared/core';

interface AccessCodeUpdate {
  id: string;
  code: string;
  isActive: boolean;
  expiresAt: Date;
  userId: string;
  estateId?: string;
}

class RealTimeAccessCodeService {
  
  async sendAccessCodeUpdate(userId: string, accessCode: AccessCodeUpdate) {
    try {
      webSocketService.sendAccessCodeUpdate(userId, {
        id: accessCode.id,
        code: accessCode.code,
        isActive: accessCode.isActive,
        expiresAt: accessCode.expiresAt,
        timestamp: new Date(),
        estateId: accessCode.estateId
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to send access code update:', error);
      return { success: false, error };
    }
  }

  async broadcastAccessCodeExpiry(accessCode: AccessCodeUpdate) {
    try {
      webSocketService.sendAccessCodeUpdate(accessCode.userId, {
        id: accessCode.id,
        code: accessCode.code,
        isActive: false,
        expiresAt: accessCode.expiresAt,
        timestamp: new Date(),
        status: 'expired'
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to broadcast access code expiry:', error);
      return { success: false, error };
    }
  }
}

export default new RealTimeAccessCodeService();