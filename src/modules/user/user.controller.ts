import { UserRepository } from '../repositories/user.repository';
import { User } from '../user/user.model';
import { ApiResponse } from '../../types/api.type';
import { UserUpdateAttributes, UserCreationAttributes } from '../../types/user.type';

class UserService {
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

  async createUser(data: UserCreationAttributes): Promise<ApiResponse<User>> {
    const user = await this.userRepository.create(data);
    return {
      status: 'success',
      statusCode: 201,
      message: 'User created successfully',
      data: user
    };
  }

  async verifyUser(payload: { email: string; code: string }): Promise<ApiResponse<null>> {
    // Example placeholder
    return {
      status: 'success',
      statusCode: 200,
      message: 'User verified successfully',
      data: null
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

  async deleteUser(id: string): Promise<ApiResponse<null>> {
    const success = await this.userRepository.delete(id);
    return {
      status: success ? 'success' : 'fail',
      statusCode: success ? 200 : 404,
      message: success ? 'User deleted successfully' : 'User not found',
      data: null
    };
  }
}

export const userService = new UserService();
