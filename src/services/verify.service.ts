import { UserRepository } from "../repositories/user.repository";
import { EstateRepository } from '../repositories/estate.repository';
import sendEmail from './email.service';
import { ResidentRepository } from '../repositories/resident.repository';
import { ApiResponse } from "../types/estate.type";
import { getFromRedis, saveToRedis, deleteFromRedis} from '../core/redis';
import { nanoid } from "nanoid";



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
        statusCode: 400,
        status: 'fail',
        message: 'Email and verification code are required',
        data: null
      };
    }
    const key = `verify:${email}`
    const verify = await getFromRedis(key);
    if (!verify || verify !== code) {
      return {
        statusCode: 400,
        status: 'fail',
        message: 'Verification code has expired or is invalid',
        data: null
      };
    }
    const user = await this.userRepository.findUserByEmail(email, code);
    if (!user) {
      return {
        statusCode: 404,
        status: 'fail',
        message: 'User not found',
        data: null
      };
    }

    user.verified = true;
    await user.save();
    await deleteFromRedis(key);
    return {
      statusCode: 200,
      status: 'success',
      message: 'User verified successfully',
      data: null
    };
  }

  async resendCode(email: string, estate_id: string): Promise<ApiResponse> {
    const user = await this.userRepository.findUserByEmail(email, estate_id);
    if (!user) {
      return {
        statusCode: 404,
        status: 'fail',
        message: 'User not found',
        data: null
      };
    }
    const key = `verify:${email}`;
    const verification_code =  nanoid(6);
    await saveToRedis(key, verification_code, 15 * 60);
    
    await sendEmail({
      to: user.email,
      subject: 'Verification Code Resent',
      text: `Your new verification code is ${verification_code}`
    });

    return {
      statusCode: 200,
      status: 'success',
      message: 'Verification code resent successfully',
      data: null
    };
  }
}

export default new VerifyService();