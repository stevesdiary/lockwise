import UserRepository from '../repositories/UserRepository';
import User from '../models/User';

class UserService {
  async getUsersByEstate(estateId: string): Promise<User[]> {
    return await UserRepository.findAllByEstate(estateId);
  }

  async getUserById(userId: string): Promise<User | null> {
    return await UserRepository.findById(userId);
  }

  async createUser(data: Partial<User>): Promise<User> {
    return await UserRepository.create(data);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User | null> {
    return await UserRepository.update(userId, data);
  }

  async deleteUser(userId: string): Promise<User | null> {
    return await UserRepository.delete(userId);
  }
}

export default new UserService();
