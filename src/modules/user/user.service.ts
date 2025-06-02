import { ApiResponse } from '../../types/api.type';
import { UserUpdateAttributes } from '../../types/user.type';
import { UserRepository } from '../repositories/user.repository';
import { User } from '../user/user.model';

class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

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

  // ... similar changes for other methods
}

export default new UserService();
