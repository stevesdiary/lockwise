import { Op } from 'sequelize';
import AccessLog from '../models/access-log.model';

class AccessLogService {
  async createAccessRequest(data: {
    user_id: string;
    estate_id: string;
    scheduled_entry_date?: Date;
    scheduled_exit_date?: Date;
    vehicle_number?: string;
    remarks?: string;
    access_type?: string;
    valid_from?: Date;
    valid_until?: Date;
    is_multi_entry?: boolean;
    max_entries?: number | null;
    created_by?: string;
  }) {
    return AccessLog.create({ ...data, status: 'active' });
  }

  async logEntry(data: { access_id: string; gate_id?: string; scanned_by?: string }) {
    return AccessLog.update(
      { entry_time: new Date(), scanned_by: data.scanned_by, gate_id: data.gate_id },
      { where: { id: data.access_id } }
    );
  }

  async logExit(accessId: string) {
    return AccessLog.update({ exit_time: new Date() }, { where: { id: accessId } });
  }

  async approveAccess(data: { access_id: string; approved_by: string }) {
    return AccessLog.update(
      { status: 'approved', approved_by: data.approved_by },
      { where: { id: data.access_id } }
    );
  }

  async revokeAccess(accessId: string, revokedBy: string) {
    const accessLog = await AccessLog.findByPk(accessId);
    if (!accessLog) throw new Error('Access record not found');

    if (['used', 'expired', 'revoked'].includes(accessLog.status)) {
      throw new Error(`Cannot revoke access that is already ${accessLog.status}`);
    }

    return AccessLog.update(
      { status: 'revoked', approved_by: revokedBy },
      { where: { id: accessId } }
    );
  }

  async getAccessLogs(filters: {
    estate_id?: string;
    user_id?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (filters.estate_id) where.estate_id = filters.estate_id;
    if (filters.user_id) where.user_id = filters.user_id;
    if (filters.status) where.status = filters.status;

    return AccessLog.findAll({
      where,
      order: [['created_at', 'DESC']],
      limit: filters.limit,
      offset: filters.offset,
    });
  }

  async getActiveAccess(filters: { user_id: string; estate_id: string }) {
    return AccessLog.findAll({ where: { ...filters, status: 'active' } });
  }
}

export default new AccessLogService();
