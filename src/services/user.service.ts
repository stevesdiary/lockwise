import { UserRepository } from '../repositories/user.repository';
import { User } from '../models/user.model';
import { Estate } from '../models/estate.model';
import { ApiResponse } from '../types/api.type';
import { UserCreationAttributes, UserUpdateAttributes } from '../types/user.type';
import { deleteFromRedis, getFromRedis } from '../core/redis';

export class UserService {
  private userRepository = new UserRepository();

  async getUsersByEstate(estateId: string): Promise<ApiResponse<User[]>> {
    const users = await this.userRepository.findAllByEstate(estateId);
    return {
      status: 'success',
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: users
    };
  }

  async getUserById(userId: string): Promise<ApiResponse<User | null>> {
    const user = await this.userRepository.findById(userId);
    return {
      status: user ? 'success' : 'fail',
      statusCode: user ? 200 : 404,
      message: user ? 'User retrieved successfully' : 'User not found',
      data: user
    };
  }

  // async getUserByEmail(email: string, estateId: string): Promise<ApiResponse<User | null>> {
  //   const user = await this.userRepository.findUserByEmail(email, estateId);
  //   return {
  //     status: user ? 'success' : 'fail',
  //     statusCode: user ? 200 : 404,
  //     message: user ? 'User retrieved successfully' : 'User not found',
  //     data: user
  //   };
  // }

  async createUser(data: UserCreationAttributes & { estate_code?: string }): Promise<ApiResponse<User>> {
    // Check if user already exists
    const existingUser = await this.userRepository.findUserByEmail(data.email);
    if (existingUser) {
      return {
        status: 'fail',
        statusCode: 409,
        message: 'User with this email already exists',
        data: null as any
      };
    }

    let userData: any = { ...data };

    // If estate_code is provided, validate and associate with estate (for residents)
    if (data.estate_code) {
      const estate = await Estate.findOne({ where: { estate_code: data.estate_code } });
      if (!estate) {
        return {
          status: 'fail',
          statusCode: 400,
          message: 'Invalid estate code',
          data: null as any
        };
      }
      userData.estate_id = estate.estate_id;
    }
    // If no estate_code provided, user is registering as estate manager
    
    delete userData.estate_code; // Remove estate_code from user data

    const user = await this.userRepository.create(userData);
    return {
      status: 'success',
      statusCode: 201,
      message: 'User created successfully',
      data: user
    };
  }

  async updateUser(id: string, data: UserUpdateAttributes): Promise<ApiResponse<User | null>> {
    const user = await this.userRepository.update(id, data);
    return {
      status: user ? 'success' : 'fail',
      statusCode: user ? 200 : 404,
      message: user ? 'User updated successfully' : 'User not found',
      data: user
    };
  }

  async deleteUser(estate_id: string, id: string): Promise<ApiResponse<null>> {
    const success = await this.userRepository.delete(estate_id, id);
    return {
      status: success ? 'success' : 'fail',
      statusCode: success ? 200 : 404,
      message: success ? 'User deleted successfully' : 'User not found',
      data: null
    };
  }

  async verifyUser(payload: { email: string; code: string }): Promise<ApiResponse<null>> {
    const user = await this.userRepository.findUserByEmail(payload.email);
    if (!user) {
      return {
        status: 'fail',
        statusCode: 404, 
        message: 'User not found',
        data: null
      };
    }

    const key = `verify:${payload.email}`;
    const verificationCode = await getFromRedis(key);
    
    if (!verificationCode) {
      return {
        statusCode: 404,
        status: "fail",
        message: "Invalid or expired verification code",
        data: null,
      };
    }

    if (verificationCode.trim().toLowerCase() === payload.code.trim().toLowerCase()) {
      await this.userRepository.update(user.id, { verified: true });
      await deleteFromRedis(key);
      
      return {
        status: 'success',
        statusCode: 200,
        message: 'User verified successfully',
        data: null
      };
    }

    return {
      status: 'fail',
      statusCode: 400,
      message: 'Invalid verification code',
      data: null
    };
  } 
}

export const userService = new UserService();