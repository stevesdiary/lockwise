import { User } from '../user/user.model';
import { UserAttributes } from '../../types/type';
import { CreationAttributes } from 'sequelize';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(userData: CreationAttributes<User>): Promise<User>;
  update(id: string, userData: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<User[]>;
}