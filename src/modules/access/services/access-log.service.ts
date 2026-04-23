import AccessLog from '../models/access-log.model';
import AccessEntry from '../models/access-entry.model';
import sequelize from '../../../shared/core/database';
import { getFromRedis, deleteFromRedis } from '../../../shared/core/redis';

export class AccessLogService {
  async logAccess(data: any) {
    return await AccessLog.create(data);
  }

  async getAccessLogs(filters: any) {
    return await AccessLog.findAll({ where: filters });
  }

  async createAccessRequest(data: any) {
    return await AccessLog.create({ ...data, status: 'pending' });
  }

  async logEntry(data: any) {
    return await AccessLog.create({ ...data, entry_time: new Date() });
  }

  async logExit(logId: string) {
    return await AccessLog.update({ exit_time: new Date() }, { where: { id: logId } });
  }

  async approveAccess(data: any) {
    return await AccessLog.update({ status: 'approved', approved_by: data.approved_by }, { where: { id: data.access_id } });
  }

  async revokeAccess(accessId: string, revokedBy: string) {
    const accessLog = await AccessLog.findByPk(accessId);
    if (!accessLog) {
      throw new Error('Access record not found');
    }
    
    if (accessLog.status === 'used' || accessLog.status === 'expired' || accessLog.status === 'revoked') {
      throw new Error(`Cannot revoke access that is already ${accessLog.status}`);
    }
    
    return await AccessLog.update({ 
      status: 'revoked', 
      approved_by: revokedBy 
    }, { 
      where: { id: accessId } 
    });
  }

  async getActiveAccess(filters: any) {
    return await AccessLog.findAll({ where: { ...filters, status: 'active' } });
  }

  async getAccessByCode(accessCode: string) {
    const accessLog = await AccessLog.findOne({ where: { access_code: accessCode } });
    
    if (!accessLog) {
      throw new Error('Access code not found');
    }

    return accessLog;
  }

  async processCodeScan(code: string, gateId?: string, scannedBy?: string, scanType?: 'entry' | 'exit') {
    const accessLog = await AccessLog.findOne({ where: { access_code: code } });

    if (!accessLog) {
      throw new Error('Invalid access code');
    }

    const validStatuses = ['active', 'pending', 'approved'];
    if (!validStatuses.includes(accessLog.status)) {
      throw new Error(`Access code is ${accessLog.status}`);
    }

    const now = new Date();

    if (accessLog.valid_from && now < new Date(accessLog.valid_from)) {
      throw new Error('Access code is not yet valid');
    }

    if (accessLog.valid_until && now > new Date(accessLog.valid_until)) {
      await accessLog.update({ status: 'expired' });
      throw new Error('Access code has expired');
    }

    // Direction enforcement:
    // 'entry' codes allow both entry and exit (resident should not be trapped).
    // 'exit'  codes are exit-only — reject at entry gates.
    // 'both'  codes allow both (explicit alias of 'entry' semantics).
    const direction = accessLog.access_direction || 'entry';
    if (scanType === 'entry' && direction === 'exit') {
      throw new Error('This code is for exit only and cannot be used for entry');
    }

    if (accessLog.is_multi_entry) {
      return await sequelize.transaction(async (t) => {
        // Atomic increment to prevent race conditions
        await accessLog.increment('used_entries', { transaction: t });
        await accessLog.reload({ transaction: t });

        if (accessLog.max_entries !== null && accessLog.max_entries !== undefined) {
          if (accessLog.used_entries > accessLog.max_entries) {
            // Undo the increment — all entries exhausted
            await accessLog.decrement('used_entries', { transaction: t });
            throw new Error('Maximum entries reached for this access code');
          }
          if (accessLog.used_entries >= accessLog.max_entries) {
            await accessLog.update({ status: 'used', scanned_by: scannedBy }, { transaction: t });
          }
        }

        const entry = await AccessEntry.create({
          access_log_id: accessLog.id,
          entry_time: now,
          gate_id: gateId,
          scanned_by: scannedBy
        }, { transaction: t });

        return { action: 'entry', accessLog, entry };
      });
    }

    // Single-entry: create entry row first, then mark used — wrapped in a
    // transaction so a failure between the two steps leaves the code retryable
    return await sequelize.transaction(async (t) => {
      const entry = await AccessEntry.create({
        access_log_id: accessLog.id,
        entry_time: now,
        gate_id: gateId,
        scanned_by: scannedBy,
      }, { transaction: t });

      await accessLog.update({
        status: 'used',
        scanned_by: scannedBy,
        entry_time: now,
      }, { transaction: t });

      return { action: 'entry', accessLog, entry };
    });
  }

  // async processCodeScan(code: string, gateId?: string, scannedBy?: string) {
  //   // Check Redis first for code validity
  //   const accessIdFromRedis = 
  //     (await getFromRedis(`access_code:${code}`)) ||
  //     (await getFromRedis(`exit_code:${code}`));

  //   if (!accessIdFromRedis) {
  //     throw new Error("Code expired or invalid");
  //   }

  //   // Get access log from database
  //   const accessLog = await AccessLog.findByPk(accessIdFromRedis);
  //   if (!accessLog || accessLog.status !== "approved") {
  //     throw new Error("Access not found or not approved");
  //   }

  //   // Check if this is an access_code (for entry)
  //   const isAccessCode = await getFromRedis(`access_code:${code}`);
  //   if (isAccessCode) {
  //     return { action: "entry", accessLog };
  //   }

  //   throw new Error("Invalid code usage or user state");
  // }

  // async getEntryStatistics(accessLogId: string) {
  //   const accessLog = await AccessLog.findByPk(accessLogId);
  //   if (!accessLog) {
  //     throw new Error("Access log not found");
  //   }

  //   return {
  //     totalEntries: 0,
  //     remainingEntries: 1
  //   };
  // }
}

export default new AccessLogService();
