import { Op } from "sequelize";
import { User } from "../user/user.model";
import { IUserRepository } from "./user.repository.interface";
import { CreationAttributes } from "sequelize";

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return User.findOne({
      where: {
        email: {
          [Op.eq]: email,
        },
      },
    });
  }

  async findById(id: string): Promise<User | null> {
    return User.findByPk(id);
  }

  async create(userData: CreationAttributes<User>): Promise<User> {
    const defaultValues = {
      estate_id: userData.estate_id,
      role: "resident",
      verified: false
    };

    return User.create({
      ...defaultValues,
      ...userData,
    });
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;
    return user.update(userData);
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await User.destroy({
      where: { id },
    });
    return deleted > 0;
  }

  async findAll(): Promise<User[]> {
    return User.findAll();
  }
}
