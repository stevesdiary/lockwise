import { Resident } from '../resident/resident.model';
import { AccessLog } from '../estate/accessLog.model';
import { Op } from 'sequelize';
import { LogCreationAttributes, LogUpdateAttributes } from '../../types/log.type';

export class AccessLogsRepository {
  async findAllByEstate(estateId: string): Promise<AccessLog[]> {
    return AccessLog.findAll({
      where: { estate_id: estateId },
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id: string): Promise<AccessLog | null> {
    return AccessLog.findByPk(id);
  }

  async create(logData: LogCreationAttributes): Promise<AccessLog> {
    return AccessLog.create(logData as any);
  }

  async update(log_id: string, logUpdateData: LogUpdateAttributes): Promise<AccessLog> {
    const log = await this.findById(log_id);
    
    const updatedLog = await AccessLog.update(logUpdateData, {
      where: { log_id },
      returning: true
    });
    if (!updatedLog[1]) {
      throw new Error(`Log with ID ${log_id} not found`);
    };
    return updatedLog as any;
  } 

  async delete(id: string): Promise<boolean> {
    const deleted = await Resident.destroy({ where: { id } });
    return deleted > 0;
  }
}