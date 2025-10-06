import { User } from '../models/user.model';
import { Estate } from '../models/estate.model';
import { Role } from '../models/role.model';
import { deleteFromRedis, getFromRedis } from '../core/redis';

type ApiResponse<T> = {
  status: 'success' | 'fail';
  statusCode: number;
  message: string;
  data: T;
};

export class UserService {

  async getUsersByEstate(estateId: string): Promise<ApiResponse<User[]>> {
    try {
      const users = await User.findAll({ where: { estate_id: estateId } });
      return {
        status: 'success',
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: users
      };
    } catch (error) {
      throw error;
    }
  }

  async getUserById(userId: string): Promise<ApiResponse<User | null>> {
    try {
      const user = await User.findByPk(userId);
      return {
        status: user ? 'success' : 'fail',
        statusCode: user ? 200 : 404,
        message: user ? 'User retrieved successfully' : 'User not found',
        data: user
      };
    } catch (error) {
      throw error;
    }
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

  async createUser(validatedData: any): Promise<ApiResponse<User>> {
    try {
      const existingUser = await User.findOne({ where: { email: validatedData.email } });
      if (existingUser) {
        return {
          status: 'fail',
          statusCode: 409,
          message: 'User with this email already exists',
          data: null as any
        };
      }
      let userData: any = { ...validatedData };

      // Find role by name and set role_id
      const roleRecord = await Role.findOne({ where: { role: validatedData.role } });
      if (!roleRecord) {
        return {
          status: 'fail',
          statusCode: 400,
          message: 'Invalid role specified',
          data: null as any
        };
      }
      userData.role_id = roleRecord.id;

      // Role-based registration logic
      if (validatedData.role === 'resident') {
        if (!validatedData.estate_code) {
          return {
            status: 'fail',
            statusCode: 400,
            message: 'Estate code is required for residents',
            data: null as any
          };
        }
        
        const estate = await Estate.findOne({ where: { estate_code: validatedData.estate_code } });
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
      
      delete userData.estate_code;
      delete userData.confirm_password;
      delete userData.role;

      const user = await User.create(userData);
      return {
        status: 'success',
        statusCode: 201,
        message: `${validatedData.role} registered successfully`,
        data: user
      };
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: string, data: any): Promise<ApiResponse<User | null>> {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return {
          status: 'fail',
          statusCode: 404,
          message: 'User not found',
          data: null
        };
      }
      
      await user.update(data);
      return {
        status: 'success',
        statusCode: 200,
        message: 'User updated successfully',
        data: user
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(estate_id: string, id: string): Promise<ApiResponse<null>> {
    try {
      const deleted = await User.destroy({ where: { estate_id, id } });
      return {
        status: deleted > 0 ? 'success' : 'fail',
        statusCode: deleted > 0 ? 200 : 404,
        message: deleted > 0 ? 'User deleted successfully' : 'User not found',
        data: null
      };
    } catch (error) {
      throw error;
    }
  }

  async verifyUser(payload: { email: string; code: string }): Promise<ApiResponse<null>> {
    try {
      const user = await User.findOne({ where: { email: payload.email } });
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
      
      if (!verificationCode || verificationCode.trim().toLowerCase() !== payload.code.trim().toLowerCase()) {
        return {
          status: 'fail',
          statusCode: 400,
          message: 'Invalid or expired verification code',
          data: null
        };
      }

      await user.update({ verified: true });
      await deleteFromRedis(key);
      
      return {
        status: 'success',
        statusCode: 200,
        message: 'User verified successfully',
        data: null
      };
    } catch (error) {
      throw error;
    }
  } 
}

export const userService = new UserService();