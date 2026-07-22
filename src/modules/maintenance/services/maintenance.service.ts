import { MaintenanceRequest, MaintenanceComment } from '../models/maintenance.model';
import { User } from '../../auth/models/user.model';
import { Role } from '../../auth/models/role.model';
import { Op } from 'sequelize';
import pushNotificationService from '../../communication/services/push.notification.service';
import { CreateMaintenanceRequest, MaintenanceStatus } from '../types/maintenance.types';

const MANAGER_ROLES = ['master', 'super_admin', 'admin', 'manager'];

export const maintenanceService = {
  async submitRequest(userId: string, estateId: string, data: CreateMaintenanceRequest) {
    const request = await MaintenanceRequest.create({
      estate_id: estateId,
      submitted_by: userId,
      unit_id: data.unit_id || null,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority || 'medium',
      photo_urls: data.photo_urls || null,
    });

    // Notify all managers in the estate
    const managerRole = await Role.findOne({ where: { role: 'manager' } });
    if (managerRole) {
      const managers = await User.findAll({
        where: { role_id: managerRole.id, estate_id: estateId, status: 'active' },
      });
      for (const manager of managers) {
        pushNotificationService.sendToUser(
          manager.id,
          'New Issue Reported',
          `New issue reported: ${data.title}`,
          { type: 'maintenance_request', request_id: request.id }
        ).catch(() => {});
      }
    }

    return request;
  },

  async listRequests(userId: string, estateId: string, role: string, statusFilter?: MaintenanceStatus) {
    const where: any = {};

    if (statusFilter) {
      where.status = statusFilter;
    }

    // Residents/security see only their own submissions
    if (!MANAGER_ROLES.includes(role)) {
      where.submitted_by = userId;
    } else {
      where.estate_id = estateId;
    }

    // Master/super_admin can see cross-estate
    if (role === 'master' || role === 'super_admin') {
      delete where.estate_id;
      delete where.submitted_by;
    }

    return MaintenanceRequest.findAll({
      where,
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'first_name', 'last_name'] },
      ],
      order: [['created_at', 'DESC']],
    });
  },

  async getRequestWithComments(requestId: string, userId: string, role: string) {
    const request = await MaintenanceRequest.findByPk(requestId, {
      include: [
        { model: User, as: 'submitter', attributes: ['id', 'first_name', 'last_name'] },
        {
          model: MaintenanceComment,
          as: 'comments',
          include: [{ model: User, as: 'author', attributes: ['id', 'first_name', 'last_name'] }],
          order: [['created_at', 'ASC']],
        },
      ],
    });

    if (!request) throw new Error('Request not found');

    // Enforce ownership for non-managers
    if (!MANAGER_ROLES.includes(role) && request.submitted_by !== userId) {
      throw new Error('Forbidden');
    }

    return request;
  },

  async updateStatus(requestId: string, newStatus: MaintenanceStatus, managerId: string) {
    const request = await MaintenanceRequest.findByPk(requestId);
    if (!request) throw new Error('Request not found');

    const updateData: any = { status: newStatus };
    if (newStatus === 'resolved') {
      updateData.resolved_at = new Date();
    }

    await request.update(updateData);

    // Create audit comment
    await MaintenanceComment.create({
      request_id: requestId,
      author_id: managerId,
      message: `Status changed to ${newStatus}`,
      is_status_change: true,
      new_status: newStatus,
    });

    // Notify the reporter
    pushNotificationService.sendToUser(
      request.submitted_by,
      'Issue Updated',
      `Your issue '${request.title}' is now ${newStatus}`,
      { type: 'maintenance_request', request_id: requestId }
    ).catch(() => {});

    return request;
  },

  async addComment(requestId: string, authorId: string, message: string) {
    const request = await MaintenanceRequest.findByPk(requestId);
    if (!request) throw new Error('Request not found');

    const comment = await MaintenanceComment.create({
      request_id: requestId,
      author_id: authorId,
      message,
    });

    // Notify the other party
    const isReporter = request.submitted_by === authorId;
    if (isReporter) {
      // Reporter commented — notify managers
      const managerRole = await Role.findOne({ where: { role: 'manager' } });
      if (managerRole) {
        const managers = await User.findAll({
          where: { role_id: managerRole.id, estate_id: request.estate_id, status: 'active' },
        });
        for (const manager of managers) {
          pushNotificationService.sendToUser(
            manager.id,
            'Update on Issue',
            `Update on issue '${request.title}'`,
            { type: 'maintenance_request', request_id: requestId }
          ).catch(() => {});
        }
      }
    } else {
      // Manager commented — notify reporter
      pushNotificationService.sendToUser(
        request.submitted_by,
        'Manager Reply',
        `Manager replied to your issue '${request.title}'`,
        { type: 'maintenance_request', request_id: requestId }
      ).catch(() => {});
    }

    return comment;
  },

  async deleteRequest(requestId: string) {
    const request = await MaintenanceRequest.findByPk(requestId);
    if (!request) throw new Error('Request not found');
    await request.destroy();
    return true;
  },
};
