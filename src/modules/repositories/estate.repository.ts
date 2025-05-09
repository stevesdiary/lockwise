import { Estate } from '../estate/estate.model';
import { CreationAttributes } from 'sequelize';

export class EstateRepository {
  async create(data: CreationAttributes<Estate>): Promise<Estate> {
    return await Estate.create(data);
  }

  async findAll(): Promise<Estate[]> {
    return await Estate.findAll();
  }

  async findById(id: string): Promise<Estate | null> {
    return await Estate.findByPk(id);
  }

  async update(id: string, data: Partial<Estate>): Promise<Estate | null> {
    const estate = await Estate.findByPk(id);
    if (!estate) return null;
    return await estate.update(data);
  }

  async delete(id: string): Promise<boolean> {
    const estate = await Estate.findByPk(id);
    if (!estate) return false;
    await estate.destroy();
    return true;
  }
}

export default new EstateRepository();