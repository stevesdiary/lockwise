import { Op, Transaction } from 'sequelize';
import { Access, AccessEntry } from '../models/access.model';
import { Resident } from '../models/resident.model';
import { Estate } from '../models/estate.model';
import { 
  AccessCreationAttributes, 
  AccessEntryCreationAttributes,
  AccessWithEntriesResponse,
  EntryOperation,
  ExitOperation
} from '../types/access.type';


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
      include: [
        { model: Resident },
        { model: Estate },
        { 
          model: AccessEntry, 
          as: 'entries',
          separate: true,
          order: [['created_at', 'DESC']]
        }
      ],
      order: [['created_at', 'DESC']],
    });
  }

  async getAccessLogById(accessId: string): Promise<Access | null> {
    return Access.findByPk(accessId, {
      include: [
        { model: Resident },
        { model: Estate },
        { 
          model: AccessEntry, 
          as: 'entries',
          separate: true,
          order: [['created_at', 'DESC']]
        }
      ]
    });
  }

  async getAccessLogsByResident(residentId: string): Promise<Access[]> {
    return Access.findAll({
      where: { resident_id: residentId },
      include: [
        { 
          model: AccessEntry, 
          as: 'entries',
          separate: true,
          order: [['created_at', 'DESC']]
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async getAccessLogsByDateRange(start: Date, end: Date): Promise<Access[]> {
    return Access.findAll({
      where: {
        date_in: {
          [Op.between]: [start, end],
        },
      },
      include: [
        { model: Resident }, 
        { model: Estate },
        { 
          model: AccessEntry, 
          as: 'entries',
          separate: true,
          order: [['created_at', 'DESC']]
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async updateAccess(logId: string, accessData: any): Promise<Access | null> {
    const access = await Access.findByPk(logId);
    if (!access) return null;

    // Update only provided fields
    if (accessData.entry_time) access.entry_time = accessData.entry_time;
    if (accessData.exit_time) access.exit_time = accessData.exit_time;
    if (accessData.remarks) access.remarks = accessData.remarks;
    if (accessData.status) access.status = accessData.status;
    if (accessData.verified_by) access.resident_id = accessData.verified_by;

    return access.save();
  }

  async checkIn(accessId: string, checkInData: any): Promise<Access | null> {
    const access = await Access.findByPk(accessId);
    if(!access){
      throw new Error('Access not found nor updated')
    }
    access.entry_time = checkInData.entry_time;
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

  async deleteAccessLog(logId: string): Promise<void> {
    await Access.destroy({ where: { id: logId } });
  }

  // Multiple Entry Operations
  async createEntry(entryData: EntryOperation, transaction?: Transaction): Promise<AccessEntry> {
    try {
      const accessEntryData: AccessEntryCreationAttributes = {
        access_id: entryData.access_id,
        entry_time: new Date(),
        scanned_by: entryData.scanned_by,
        gate_id: entryData.gate_id
      };
      
      return await AccessEntry.create(accessEntryData, { transaction });
    } catch (error) {
      console.error('Failed to create access entry:', error);
      throw new Error('Failed to create access entry');
    }
  }

  async createExit(exitData: ExitOperation, transaction?: Transaction): Promise<AccessEntry | null> {
    try {
      const entry = await AccessEntry.findByPk(exitData.entry_id, { transaction });
      if (!entry) return null;

      entry.exit_time = new Date();
      if (exitData.scanned_by) entry.scanned_by = exitData.scanned_by;
      if (exitData.gate_id) entry.gate_id = exitData.gate_id;

      return await entry.save({ transaction });
    } catch (error) {
      console.error('Failed to update exit time:', error);
      throw new Error('Failed to update exit time');
    }
  }

  async getAccessWithEntries(accessId: string): Promise<AccessWithEntriesResponse | null> {
    const access = await this.getAccessLogById(accessId);
    if (!access) return null;

    const response: AccessWithEntriesResponse = {
      ...access.toJSON(),
      total_entries: access.entries?.length || 0,
      remaining_entries: access.getRemainingEntries()
    };

    return response;
  }

  async getActiveEntries( accessId: string): Promise<AccessEntry[]> {
    return AccessEntry.findAll({
      where: {
        access_id: accessId,
        exit_time: { [Op.not]: true }
      },
      order: [['created_at', 'DESC']]
    });
  }

  async getEntriesByAccess(accessId: string): Promise<AccessEntry[]> {
    return AccessEntry.findAll({
      where: {
        access_id: accessId
      },
      order: [['created_at', 'DESC']]
    });
  }

  async canVisitorEnter(accessId: string): Promise<{ canEnter: boolean; reason?: string }> {
    const access = await this.getAccessLogById(accessId);
    if (!access) {
      return { canEnter: false, reason: 'Access record not found' };
    }

    if (access.status !== 'approved') {
      return { canEnter: false, reason: `Access status is ${access.status}` };
    }

    const now = new Date();
    if (now < access.date_in || now > access.date_out) {
      return { canEnter: false, reason: 'Access is outside valid date range' };
    }

    if (!access.canEnter()) {
      return { 
        canEnter: false, 
        reason: access.is_multi_entry 
          ? 'Maximum number of entries reached' 
          : 'Single entry already used'
      };
    }

    if (access.hasActiveEntry()) {
      return { canEnter: false, reason: 'Visitor is already inside' };
    }

    return { canEnter: true };
  }
}
