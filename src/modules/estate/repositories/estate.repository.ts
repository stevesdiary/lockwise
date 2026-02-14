import { Estate } from '../../estate/models/estate.model';
import { CreationAttributes } from 'sequelize';
import { EstateCreationAttributes } from '../types/estate.types';

export class EstateRepository {
  async create(data: EstateCreationAttributes): Promise<Estate> {
    return await Estate.create(data);
  }

  async findAll(): Promise<Estate[]> {
    return await Estate.findAll();
  }

  async findById(estate_id: string): Promise<Estate | null> {
    return await Estate.findByPk(estate_id);
  }

  async update(estate_id: string, data: Partial<Estate>): Promise<Estate | null> {
    const estate = await Estate.findByPk(estate_id);
    if (!estate) return null;
    return await estate.update(data as any);
  }

  async delete(estate_id: string): Promise<boolean> {
    const estate = await Estate.findByPk(estate_id);
    if (!estate) return false;
    await estate.destroy();
    return true;
  }
}

export default new EstateRepository();
