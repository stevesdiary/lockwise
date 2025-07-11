import { Model } from "sequelize-typescript";
import { ResidentCreationAttributes } from "../../types/resident.type";
import { Resident } from "../resident/resident.model";
import { User } from "../user/user.model";
import { Unit } from "../estate/unit.model";

export class ResidentRepository {
  async findById(id: string): Promise<Resident | null> {
    return Resident.findByPk(id);
  }

  async create(residentData: ResidentCreationAttributes): Promise<Resident> {
    return Resident.create(residentData as any);
  }

  async findByEmail(email: string, estateId: string): Promise<User | null> {
    return User.findOne({
      where: {
        email,
        estate_id: estateId,
      },
      include:
        {
          model: Resident,
          as: 'estateResidents',
          where: { estate_id: estateId },
          required: false,
          attributes: ['subscribed'],
          // include: {
          //   Model: Unit,
          //   as: 'unit'
          // }
        },
        
    });
  }
  
  async update(id: string, residentData: Partial<Resident>): Promise<Resident | null> {
    const resident = await this.findById(id);
    if (!resident) return null;
    return resident.update(residentData);
  }
  async delete(id: string): Promise<boolean> {
    const deleted = await Resident.destroy({ where: { id } });
    return deleted > 0;
  }
  async findAllByEstate(estateId: string): Promise<Resident[]> {
    return Resident.findAll({
      where: { estate_id: estateId },
      order: [['createdAt', 'DESC']],
    });
  }

  async findAll(): Promise<Resident[]> {
    return Resident.findAll();
  }
}
