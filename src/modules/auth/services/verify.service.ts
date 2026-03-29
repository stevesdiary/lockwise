import { UserRepository } from "../repositories/user.repository";
import { EstateRepository } from '../../estate/repositories/estate.repository';
import sendEmail from '../../communication/services/email.service';
import { ResidentRepository } from '../../estate/repositories/resident.repository';
import { ApiResponse } from "../../../shared/types/api.types";
import { getFromRedis, saveToRedis, deleteFromRedis} from '../../../shared/core/redis';
import { customAlphabet } from "nanoid";
import { response } from 'express';


const nanoid = customAlphabet("1234567890");



export class VerifyService {
  private userRepository: UserRepository;
  private residentRepository: ResidentRepository;
  private estateRepository: EstateRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.estateRepository = new EstateRepository();
    this.residentRepository = new ResidentRepository();
  }

  async verifyUser(email: string, code: string): Promise<ApiResponse> {
    if (!email || !code) {
      return {
        success: false,
        message: 'Email and verification code are required',
        data: null
      };
    }
    const key = `verify:${email}`
    const verify = await getFromRedis<string>(key);
    if (!verify || verify !== code) {
      return {
        success: false,
        message: 'Verification code has expired or is invalid',
        data: null
      };
    }
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        data: null
      };
    }

    user.verified = true;
    await user.save();
    await deleteFromRedis(key);
    return {
      success: true,
      message: 'User verified successfully',
      data: null
    };
  }

  async resendCode(email: string, estate_id: string): Promise<ApiResponse> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      return {
        success: false,
        message: 'User not found',
        data: null
      };
    }
    const key = `verify:${email}`;
    const verification_code =  nanoid(6);
    await saveToRedis(key, verification_code, 15 * 60);
    
    const sendNotification = await sendEmail.sendVerificationEmail(user.email, user.first_name, verification_code);

    return {
      success: true,
      message: 'Verification code resent successfully' + sendNotification,
      data: null
    };
  }
}

export default new VerifyService();