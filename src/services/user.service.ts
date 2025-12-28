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

  async getUserByEmail(email: string, estateId: string): Promise<ApiResponse<User | null>> {
    const user = await User.findOne({
      where: { email },
      include: [{
        model: Estate,
        as: 'estate',
        where: { estate_id: estateId },
        attributes: []
      }]
    });
    return {
      status: user ? 'success' : 'fail',
      statusCode: user ? 200 : 404,
      message: user ? 'User retrieved successfully' : 'User not found',
      data: user
    };
  }

  async registerResident(validatedData: any): Promise<ApiResponse<User>> {
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

      if (!validatedData.estate_code) {
        return {
          status: 'fail',
          statusCode: 400,
          message: 'Estate code is required for resident registration',
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

      const residentRole = await Role.findOne({ where: { role: 'resident' } });
      if (!residentRole) {
        return {
          status: 'fail',
          statusCode: 500,
          message: 'Resident role not found in system',
          data: null as any
        };
      }

      const userData = {
        ...validatedData,
        role_id: residentRole.id,
        estate_id: estate.estate_id
      };
      
      delete userData.estate_code;
      delete userData.confirm_password;

      const user = await User.create(userData);
      return {
        status: 'success',
        statusCode: 201,
        message: 'Resident registered successfully',
        data: user
      };
    } catch (error) {
      throw error;
    }
  }

  async registerStaffUser(validatedData: any, roleType: 'security' | 'admin' | 'manager'): Promise<ApiResponse<User>> {
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

      const roleRecord = await Role.findOne({ where: { role: roleType } });
      if (!roleRecord) {
        return {
          status: 'fail',
          statusCode: 400,
          message: `${roleType} role not found in system`,
          data: null as any
        };
      }

      let userData: any = {
        ...validatedData,
        role_id: roleRecord.id
      };

      // Security staff need estate association
      if (roleType === 'security') {
        if (!validatedData.estate_code) {
          return {
            status: 'fail',
            statusCode: 400,
            message: 'Estate code is required for security staff',
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

      const user = await User.create(userData);
      return {
        status: 'success',
        statusCode: 201,
        message: `${roleType} registered successfully`,
        data: user
      };
    } catch (error) {
      throw error;
    }
  }

  async createUser(validatedData: any): Promise<ApiResponse<User>> {
    // Legacy method - redirect to appropriate registration method
    if (validatedData.role === 'resident') {
      return this.registerResident(validatedData);
    } else if (['security', 'admin', 'manager'].includes(validatedData.role)) {
      return this.registerStaffUser(validatedData, validatedData.role);
    } else {
      return {
        status: 'fail',
        statusCode: 400,
        message: 'Invalid role specified',
        data: null as any
      };
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