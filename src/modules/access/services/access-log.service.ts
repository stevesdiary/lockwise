import AccessLog from '../models/access-log.model';
import { getFromRedis, deleteFromRedis } from '../../../shared/core/redis';
// import entryCountingService from './entry-counting.service';

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
    return await AccessLog.update({ exit_time: new Date() }, { where: { log_id: logId } });
  }

  async approveAccess(data: any) {
    return await AccessLog.update({ status: 'approved', approved_by: data.approved_by }, { where: { log_id: data.access_id } });
  }

  async getActiveAccess(filters: any) {
    return await AccessLog.findAll({ where: { ...filters, status: 'active' } });
  }

  async processCodeScan(code: string, gateId?: string, scannedBy?: string) {
    const accessLog = await AccessLog.findOne({ where: { access_code: code } });
    
    if (!accessLog) {
      throw new Error('Invalid access code');
    }

    if (accessLog.status !== 'pending' && accessLog.status !== 'approved') {
      throw new Error(`Access code is ${accessLog.status}`);
    }

    if (accessLog.valid_until && new Date() > new Date(accessLog.valid_until)) {
      await accessLog.update({ status: 'expired' });
      throw new Error('Access code has expired');
    }

    await accessLog.update({
      status: 'approved',
      scanned_by: scannedBy,
      // used_entries: accessLog.used_entries + 1
    });

    return {
      action: 'entry',
      accessLog,
      entry: null
    };
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
