import AccessLog from '../models/access-log.model';
import AccessEntry from '../models/access-entry.model';
import sequelize from '../../../shared/core/database';
import { Gate } from '../../estate/models/gate.model';

class AccessCodeService {
  async generateCode(data: {
    user_id: string;
    estate_id: string;
    code: string;
    guest_name: string;
    guest_phone?: string;
    access_type?: string;
    valid_from: Date;
    valid_until: Date;
    is_multi_entry?: boolean;
    max_entries?: number | null;
    access_direction?: 'entry' | 'exit' | 'both';
    headshot_url?: string | null;
  }) {
    return AccessLog.create({
      ...data,
      access_code: data.code,
      status: 'active',
    });
  }

  async validateCode(code: string) {
    return AccessLog.findOne({ where: { access_code: code } });
  }

  async processCodeScan(
    code: string,
    gateId?: string,
    scannedBy?: string,
    scanType?: 'entry' | 'exit',
    estateId?: string
  ) {
    const where: any = { access_code: code };
    if (estateId) where.estate_id = estateId;

    const accessLog = await AccessLog.findOne({ where });
    if (!accessLog) throw new Error('Invalid access code');

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

    const direction = accessLog.access_direction || 'entry';
    if (scanType === 'entry' && direction === 'exit') {
      throw new Error('This code is for exit only and cannot be used for entry');
    }

    if (accessLog.is_multi_entry) {
      return sequelize.transaction(async (t) => {
        await accessLog.increment('used_entries', { transaction: t });
        await accessLog.reload({ transaction: t });

        if (accessLog.max_entries !== null && accessLog.max_entries !== undefined) {
          if (accessLog.used_entries > accessLog.max_entries) {
            await accessLog.decrement('used_entries', { transaction: t });
            throw new Error('Maximum entries reached for this access code');
          }
          if (accessLog.used_entries >= accessLog.max_entries) {
            await accessLog.update({ status: 'used', scanned_by: scannedBy }, { transaction: t });
          }
        }

        const entry = await AccessEntry.create(
          { access_log_id: accessLog.id, entry_time: now, gate_id: gateId, scanned_by: scannedBy },
          { transaction: t }
        );

        return { action: 'entry', accessLog, entry };
      });
    }

    return sequelize.transaction(async (t) => {
      const entry = await AccessEntry.create(
        { access_log_id: accessLog.id, entry_time: now, gate_id: gateId, scanned_by: scannedBy },
        { transaction: t }
      );

      await accessLog.update(
        { status: 'used', scanned_by: scannedBy, entry_time: now },
        { transaction: t }
      );

      return { action: 'entry', accessLog, entry };
    });
  }

  async approveCode(
    code: string,
    scannedBy: string,
    gateId?: string,
    estateId?: string
  ) {
    const where: any = { access_code: code, status: 'active' };
    if (estateId) where.estate_id = estateId;

    const accessLog = await AccessLog.findOne({ where });
    if (!accessLog) throw new Error('Access code not found');

    const direction = (accessLog as any).access_direction as 'entry' | 'exit' | 'both';
    const now = new Date();
    const isExitScan =
      direction === 'exit' ||
      (direction === 'both' && (accessLog as any).entry_time != null);

    const timeField = isExitScan ? 'exit_time' : 'entry_time';
    const updateFields: any = { [timeField]: now, scanned_by: scannedBy };
    if (gateId) updateFields.gate_id = gateId;

    if ((accessLog as any).is_multi_entry) {
      await sequelize.transaction(async (t) => {
        await accessLog.increment('used_entries', { transaction: t });
        await accessLog.reload({ transaction: t });

        const maxEntries = (accessLog as any).max_entries as number | null;
        const usedEntries = (accessLog as any).used_entries as number;

        if (maxEntries !== null && maxEntries !== undefined && usedEntries > maxEntries) {
          await accessLog.decrement('used_entries', { transaction: t });
          throw new Error('Maximum entries reached for this access code');
        }

        const isExhausted = maxEntries !== null && maxEntries !== undefined && usedEntries >= maxEntries;
        await accessLog.update(
          { ...updateFields, status: isExhausted ? 'used' : 'active' },
          { transaction: t }
        );
      });
    } else {
      await accessLog.update({ ...updateFields, status: 'approved' });
    }

    return { accessLog, isExitScan };
  }

  async rejectCode(
    code: string,
    scannedBy: string,
    reason?: string,
    gateId?: string,
    estateId?: string
  ) {
    const where: any = { access_code: code, status: 'active' };
    if (estateId) where.estate_id = estateId;

    const accessLog = await AccessLog.findOne({ where });
    if (!accessLog) throw new Error('Access code not found');

    await accessLog.update({
      status: 'rejected',
      scanned_by: scannedBy,
      remark: reason,
      ...(gateId ? { gate_id: gateId } : {}),
    });

    return accessLog;
  }

  async revokeCode(code: string, userId: string) {
    const { Op } = await import('sequelize');
    const accessLog = await AccessLog.findOne({
      where: { access_code: code, user_id: userId, status: { [Op.in]: ['active', 'pending'] } },
    });
    if (!accessLog) throw new Error('Access code not found or cannot be revoked');

    await accessLog.update({ status: 'revoked' });
    return accessLog;
  }
}

export default new AccessCodeService();
