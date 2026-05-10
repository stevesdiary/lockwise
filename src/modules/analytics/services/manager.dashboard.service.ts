import { Op } from 'sequelize';
import { Payment } from '../../payment/models/payment.model';
import { User } from '../../auth/models/user.model';
import accessLogService from '../../access/services/access-log.service';
import AccessLog from '../../access/models/access-log.model';
import sequelize from '../../../shared/core/database';
import { QueryTypes } from 'sequelize';

export const managerDashboardService = {
  getEstateOverview: async (estate_id: string) => {
    const [totalResidents, totalPayments, totalRevenue, activeSubscribersResult] = await Promise.all([
      User.count({ where: { estate_id, user_type: 'resident' } }),
      Payment.count({ where: { estate_id }}),
      Payment.sum('amount', { where: { estate_id, payment_status: 'completed' }}),
      sequelize.query<{ count: string }>(
        `SELECT COUNT(*)::text as count
          FROM subscriptions
          WHERE estate_id = $1
          AND status = 'active'`,
        {
          bind: [estate_id],
          type: QueryTypes.SELECT,
          plain: true
        }
      )
    ]);

    const activeSubscribers = Number(activeSubscribersResult?.count || 0);

    return {
      totalResidents,
      activeSubscribers,
      // Backward compatibility for existing mobile client shape
      activeSubscriptions: activeSubscribers,
      totalPayments,
      totalRevenue: totalRevenue || 0
    };
  },

  getEstateResidents: async (estate_id: string, filters: { limit?: number; offset?: number }) => {
    return await User.findAll({
      where: { estate_id },
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'status', 'user_type', 'createdAt'],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      order: [['createdAt', 'DESC']]
    });
  },

  getPendingEstateResidents: async (estate_id: string, filters: { limit?: number; offset?: number }) => {
    return await User.findAll({
      where: {
        estate_id,
        user_type: 'resident',
        status: 'pending',
      },
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'status', 'createdAt'],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      order: [['createdAt', 'DESC']],
    });
  },

  getEstateAccessLogs: async (estate_id: string, filters: { limit?: number; offset?: number; from_date?: string; to_date?: string }) => {
    const where: any = { estate_id };
    if (filters.from_date || filters.to_date) {
      const from = filters.from_date ? new Date(filters.from_date) : new Date(0);
      const to = filters.to_date ? new Date(filters.to_date) : new Date();
      to.setHours(23, 59, 59, 999);
      where.created_at = { [Op.between]: [from, to] };
    }
    return await AccessLog.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email'] },
        { model: User, as: 'scanner', attributes: ['first_name', 'last_name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
      limit: filters.limit || 500,
      offset: filters.offset || 0,
    });
  },

  getEstatePayments: async (estate_id: string, filters: { limit?: number; offset?: number; status?: string }) => {
    return await Payment.findAll({
      where: {
        estate_id,
        ...(filters.status && { payment_status: filters.status })
      },
      include: [
        { model: User, attributes: ['first_name', 'last_name', 'email'] }
      ],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      order: [['createdAt', 'DESC']]
    });
  },

  getPendingAccessRequests: async (estate_id: string) => {
    return await AccessLog.findAll({
      where: { estate_id, status: 'active' },
      include: [{ model: User, as: 'user', attributes: ['first_name', 'last_name', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']]
    });
  },

  approveAccessRequest: async (access_id: string, approved_by: string) => {
    return await accessLogService.approveAccess({ access_id, approved_by });
  },

  revokeAccessRequest: async (access_id: string, revoked_by: string) => {
    return await accessLogService.revokeAccess(access_id, revoked_by);
  },

  updateUserRole: async (user_id: string, role_id: string, user_type?: string) => {
    const updateData: any = { role_id };
    if (user_type) updateData.user_type = user_type;
    return await User.update(updateData, { where: { id: user_id } });
  },

  updateResidentStatus: async (user_id: string, status: 'active' | 'inactive' | 'suspended' | 'pending') => {
    return await User.update({ status }, { where: { id: user_id } });
  },

  rejectResidentJoinRequest: async (user_id: string) => {
    return await User.update(
      {
        status: 'inactive',
        estate_id: null as any,
      } as any,
      { where: { id: user_id, user_type: 'resident' } }
    );
  },

  getEstateSecurityPersonnel: async (estate_id: string) => {
    return await User.findAll({
      where: { estate_id, user_type: 'security' } as any,
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
  },

  getEstateStaff: async (estate_id: string) => {
    return await User.findAll({
      where: { estate_id, user_type: ['security', 'domestic_staff'] } as any,
      attributes: ['id', 'first_name', 'last_name', 'email', 'phone', 'status', 'user_type', 'createdAt'],
      order: [['user_type', 'ASC'], ['createdAt', 'DESC']],
    });
  },

  createStaffAccount: async (
    estate_id: string,
    data: { first_name: string; last_name: string; email: string; password: string; role: 'security' | 'domestic_staff'; phone?: string }
  ) => {
    const { Role } = await import('../../auth/models/role.model');
    const bcrypt = (await import('bcryptjs')).default;

    const existing = await User.findOne({ where: { email: data.email } as any });
    if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 409 });

    const roleRecord = await Role.findOne({ where: { role: data.role } as any });
    if (!roleRecord) throw new Error(`Role '${data.role}' not found`);

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await User.create({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email.toLowerCase().trim(),
      password: hashed,
      phone: data.phone || null,
      user_type: data.role,
      role_id: (roleRecord as any).id,
      estate_id,
      status: 'active',
    } as any);

    return { id: (user as any).id, first_name: data.first_name, last_name: data.last_name, email: data.email, user_type: data.role };
  },

  setSecurityStatus: async (user_id: string, status: 'active' | 'inactive') => {
    return await User.update({ status }, { where: { id: user_id, user_type: 'security' } as any });
  },

  setStaffStatus: async (user_id: string, estate_id: string, status: 'active' | 'inactive') => {
    const [affected] = await User.update(
      { status } as any,
      { where: { id: user_id, estate_id, user_type: ['security', 'domestic_staff'] } as any }
    );
    return affected > 0;
  },

  deleteSecurityUser: async (user_id: string, estate_id: string) => {
    const [affected] = await User.update(
      { estate_id: null as any, status: 'inactive' } as any,
      { where: { id: user_id, user_type: 'security', estate_id } as any }
    );
    return affected > 0;
  },

  removeStaffMember: async (user_id: string, estate_id: string) => {
    const [affected] = await User.update(
      { estate_id: null as any, status: 'inactive' } as any,
      { where: { id: user_id, estate_id, user_type: ['security', 'domestic_staff'] } as any }
    );
    return affected > 0;
  },
};
