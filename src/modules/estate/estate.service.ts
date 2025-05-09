import { EstateRepository } from '../repositories/estate.repository';
import { Estate } from "./estate.model";
import { CreationAttributes } from 'sequelize';

class EstateService {
  private estateRepository: EstateRepository;

  constructor() {
    this.estateRepository = new EstateRepository();
  }

  async createEstate(data: CreationAttributes<Estate>): Promise<Estate> {
    return await this.estateRepository.create(data);
  }

  async getAllEstates(): Promise<Estate[]> {
    return await this.estateRepository.findAll();
  }

  async getOneEstate(id: string): Promise<Estate | null> {
    return await this.estateRepository.findById(id);
  }

  async updateEstate(id: string, data: Partial<Estate>): Promise<Estate | null> {
    return await this.estateRepository.update(id, data);
  }

  async deleteEstate(id: string): Promise<boolean> {
    return await this.estateRepository.delete(id);
  }
}

export default new EstateService();