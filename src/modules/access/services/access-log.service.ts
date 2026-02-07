import AccessLog from '../models/access-log.model';

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
}

export default new AccessLogService();
