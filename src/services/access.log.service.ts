import { AccessLog } from '../models/access.log.model';
import { User } from '../models/user.model';
import { Estate } from '../models/estate.model';

export const accessLogService = {
  logAccess: async (data: {
    user_id: string;
    estate_id: string;
    action: 'entry' | 'exit';
    status: 'success' | 'denied';
    access_method?: string;
    device_info?: string;
    location?: string;
  }) => {
    return await AccessLog.create(data);
  },

  getAccessLogs: async (filters: {
    user_id?: string;
    estate_id?: string;
    limit?: number;
    offset?: number;
  }) => {
    return await AccessLog.findAll({
      where: {
        ...(filters.user_id && { user_id: filters.user_id }),
        ...(filters.estate_id && { estate_id: filters.estate_id })
      },
      include: [
        { model: User, attributes: ['first_name', 'last_name', 'email'] },
        { model: Estate, attributes: ['name'] }
      ],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      order: [['createdAt', 'DESC']]
    });
  }
};