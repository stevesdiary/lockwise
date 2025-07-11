import { Resident } from '../resident/resident.model';
import { Access } from '../access/access.model';
import { Op, Transaction } from 'sequelize';
import { AccessCreationAttributes } from '../../types/access.type';
import { Estate } from '../estate/estate.model';


export class AccessRepository {
  async createAccessLog(data: AccessCreationAttributes, transaction?: Transaction): Promise<Access> {
    try {
      return await Access.create(data, { transaction });
    } catch (error) {
      console.error('Failed to create access log:', error);
      throw new Error('Failed to create access log');
    }
  }

  async getAllAccessLogs(): Promise<Access[]> {
    return Access.findAll({
      include: [Resident, Estate],
      order: [['createdAt', 'DESC']],
    });
  }

  async getAccessLogsByResident(residentId: string): Promise<Access[]> {
    return Access.findAll({
      where: { resident_id: residentId },
      // include: [Resident, Estate],
    });
  }

  async getAccessLogsByDateRange(start: Date, end: Date): Promise<Access[]> {
    return Access.findAll({
      where: {
        schedule_in: {
          [Op.between]: [start, end],
        },
      },
      include: [Resident, Estate],
    });
  }

  async updateAccess(logId: string, accessData: any): Promise<Access | null> {
    const access = await Access.findByPk(logId);
    if (!access) return null;

    access.entry_time = accessData.entry_time;
    access.exit_time = accessData.exit_time;
    access.remarks = accessData.remarks;
    access.status = accessData.status;

    return access.save();
  }
  
  async checkIn(accessId: string, checkInData: any): Promise<Access | null> {
    const access = await Access.findByPk(accessId);
    if(!access){
      throw new Error('Access not found nor updated')
    }
    access.entry_time = checkInData.entry_time;
    // access.verified_by = checkInData.verified_by;
    return access;
  }


  async getPendingAccessLogs(estateId: string): Promise<Access[]> {
    return Access.findAll({
      where: {
        estate_id: estateId,
        status: 'pending',
      },
      include: [Resident],
    });
  }

  async getAccessLogById(logId: string): Promise<Access | null> {
    return Access.findByPk(logId, { include: [Resident, Estate] });
  }

  async deleteAccessLog(logId: string): Promise<void> {
    await Access.destroy({ where: { log_id: logId } });
  }
}
