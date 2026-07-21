import { Op } from 'sequelize';
import { DemoRequest } from '../models/demo-request.model';
import EmailService from './email.service';

class DemoRequestService {
  async createRequest(data: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    estate_size?: string;
    message?: string;
  }): Promise<DemoRequest> {
    const request = await DemoRequest.create({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      phone: data.phone || null,
      company: data.company || null,
      estate_size: data.estate_size || null,
      message: data.message || null,
      status: 'pending',
    } as any);

    // Fire-and-forget emails
    this.sendConfirmationEmail(data.email, data.name).catch(() => {});
    this.sendAdminNotification(data).catch(() => {});

    return request;
  }

  async updateStatus(id: string, status: string, notes?: string): Promise<boolean> {
    const updateData: any = { status };
    if (notes !== undefined) updateData.notes = notes;
    if (status === 'contacted') updateData.contacted_at = new Date();

    const [count] = await DemoRequest.update(updateData, { where: { id } });
    return count > 0;
  }

  async getRequest(id: string): Promise<DemoRequest | null> {
    return DemoRequest.findByPk(id);
  }

  async getRequests(filters: { status?: string; page?: number; limit?: number } = {}) {
    const { status, page = 1, limit = 20 } = filters;
    const where: any = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { rows, count } = await DemoRequest.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      requests: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  async getStats() {
    const total = await DemoRequest.count();
    const pending = await DemoRequest.count({ where: { status: 'pending' } });
    const contacted = await DemoRequest.count({ where: { status: 'contacted' } });
    const scheduled = await DemoRequest.count({ where: { status: 'scheduled' } });
    const completed = await DemoRequest.count({ where: { status: 'completed' } });

    return { total, pending, contacted, scheduled, completed };
  }

  private async sendConfirmationEmail(email: string, name: string): Promise<void> {
    await EmailService.sendEmail({
      to: email,
      template: 'demoRequestConfirmation',
      data: { name },
    });
  }

  private async sendAdminNotification(data: { name: string; email: string; phone?: string; company?: string; estate_size?: string; message?: string }): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@lockwise.app';
    await EmailService.sendEmail({
      to: adminEmail,
      template: 'demoRequestAdminNotification',
      data: {
        requester_name: data.name,
        requester_email: data.email,
        requester_phone: data.phone || 'Not provided',
        company: data.company || 'Not provided',
        estate_size: data.estate_size || 'Not provided',
        message: data.message || 'No additional details',
      },
    });
  }
}

export default new DemoRequestService();
