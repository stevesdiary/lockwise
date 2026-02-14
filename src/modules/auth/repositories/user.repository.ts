// src/repositories/user.repository.ts
import { User } from '../../auth/models/user.model';
import { CreationAttributes } from 'sequelize';

export class UserRepository {
  async findAllByEstate(estateId: string): Promise<User[]> {
    return await User.findAll({ where: { estate_id: estateId } });
  }

  async findById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  async create(data: CreationAttributes<User>): Promise<User> {
    return await User.create(data);
  }

  async update(id: string, data: Partial<CreationAttributes<User>>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    return await user.update(data);
  }

  async updatePassword(estate_id: string, email: string, password: string): Promise<User | null> {
    const user = await this.findUserByEmail(email);
    if(!user) return null;
    return await user.update({
      password: password
    });
  }
  async delete(estate_id: string, id: string): Promise<boolean> {
    const deleted = await User.destroy({ 
      where: { 
        estate_id,
        id 
      } 
    });
    return deleted > 0;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email} });
  }
}
