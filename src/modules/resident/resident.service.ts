import { ResidentRepository } from '../repositories/resident.repository';
import { Resident } from './resident.model';

export class ResidentService {
  private readonly residentRepo = new ResidentRepository();
  
  async getAllResidents(): Promise<Resident[]> {
    return await this.residentRepo.findAll();
  }
  
  async getOneResident(residentId: string, estateId: string): Promise<Resident | null> {
    return await this.residentRepo.findById(residentId);
  }

  async createResident(residentData: Partial<Resident>): Promise<Resident> {
    return await this.residentRepo.create(residentData);
  }

  async updateResident(residentId: string, data: Partial<Resident>): Promise<Resident | null> {
    return await this.residentRepo.update(residentId, data);
  }

  async deleteResident(residentId: string): Promise<boolean> {
    return await this.residentRepo.delete(residentId);
  }

  async getResidentsByEstate(estateId: string): Promise<Resident[]> {
    return await this.residentRepo.findAllByEstate(estateId);
  }
}

export default ResidentService;