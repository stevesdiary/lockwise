import { saveToRedis, getFromRedis, deleteFromRedis } from '../../../shared/core/redis';
import smsService from '../../communication/services/sms.service';

class PhoneVerificationService {
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phone: string): Promise<void> {
    const otp = this.generateOTP();
    const key = `otp:${phone}`;
    
    await saveToRedis(key, otp, 600); // 10 minutes expiry
    await smsService.sendOTP(phone, otp);
  }

  async verifyOTP(phone: string, otp: string): Promise<boolean> {
    const key = `otp:${phone}`;
    const storedOTP = await getFromRedis(key);
    
    if (!storedOTP || storedOTP !== otp) {
      return false;
    }
    
    await deleteFromRedis(key);
    return true;
  }
}

export default new PhoneVerificationService();
