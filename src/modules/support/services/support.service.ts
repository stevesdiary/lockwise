import { SupportTicket, SupportMessage } from '../../support/models/support.model';
import { User } from '../../auth/models/user.model';
import { Role } from '../../auth/models/role.model';
import { Estate } from '../../estate/models/estate.model';
import notificationService from '../../communication/services/notification.service';
import pushNotificationService from '../../communication/services/push.notification.service';

export const supportService = {
  async getSupportInfo(estateId?: string) {
    const supportWhatsapp = process.env.SUPPORT_WHATSAPP || '';
    
    let estateContact = null;
    if (estateId) {
      const estate = await Estate.findByPk(estateId);
      if (estate?.contact_info) {
        estateContact = {
          phone: estate.contact_info.phone,
          email: estate.contact_info.email,
          name: estate.name
        };
      }
    }

    return {
      supportWhatsapp,
      estateContact
    };
  },

  async createTicket(userId: string, data: { subject: string; description: string; category: string; priority?: string }) {
    const ticket = await SupportTicket.create({
      user_id: userId,
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority || 'medium',
      status: 'open'
    });

    // Notify customer service agents
    const csRole = await Role.findOne({ where: { role: 'customer_service' } });
    const agents = await User.findAll({ where: { role_id: csRole?.id } });
    for (const agent of agents) {
      await pushNotificationService.sendToUser(
        agent.id,
        'New Support Ticket',
        `${data.subject} - ${data.category}`,
        { type: 'support_ticket', ticket_id: ticket.id }
      );
    }

    return ticket;
  },

  async getUserTickets(userId: string) {
    return await SupportTicket.findAll({
      where: { user_id: userId },
      include: [{ model: User, as: 'agent', attributes: ['id', 'first_name', 'last_name'] }],
      order: [['created_at', 'DESC']]
    });
  },

  async getAgentTickets(agentId: string) {
    return await SupportTicket.findAll({
      where: { assigned_agent_id: agentId },
      include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] }],
      order: [['created_at', 'DESC']]
    });
  },

  async getOpenTickets() {
    return await SupportTicket.findAll({
      where: { status: 'open' },
      include: [{ model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] }],
      order: [['priority', 'DESC'], ['created_at', 'ASC']]
    });
  },

  async assignTicket(ticketId: string, agentId: string) {
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    await ticket.update({
      assigned_agent_id: agentId,
      status: 'in_progress'
    });

    await pushNotificationService.sendToUser(
      ticket.user_id,
      'Ticket Assigned',
      'A customer service agent has been assigned to your ticket',
      { type: 'support_ticket', ticket_id: ticketId }
    );

    return ticket;
  },

  async sendMessage(ticketId: string, senderId: string, message: string, isInternal = false, file?: Express.Multer.File) {
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const msg = await SupportMessage.create({
      ticket_id: ticketId,
      sender_id: senderId,
      message,
      is_internal: isInternal,
      attachment_url: file?.path || null,
      attachment_type: file?.mimetype || null
    });

    // Notify recipient
    const recipientId = senderId === ticket.user_id ? ticket.assigned_agent_id : ticket.user_id;
    if (recipientId && !isInternal) {
      await pushNotificationService.sendToUser(
        recipientId,
        'New Message',
        message.substring(0, 50),
        { type: 'support_message', ticket_id: ticketId }
      );
    }

    return msg;
  },

  async getTicketMessages(ticketId: string, userId: string) {
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    const user = await User.findByPk(userId, { include: [Role] });
    const isAgent = user?.role?.role === 'customer_service';

    return await SupportMessage.findAll({
      where: {
        ticket_id: ticketId,
        ...(isAgent ? {} : { is_internal: false })
      },
      include: [{ model: User, as: 'sender', attributes: ['id', 'first_name', 'last_name'] }],
      order: [['created_at', 'ASC']]
    });
  },

  async updateTicketStatus(ticketId: string, status: string) {
    const ticket = await SupportTicket.findByPk(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    await ticket.update({ status });

    if (status === 'resolved' || status === 'closed') {
      await pushNotificationService.sendToUser(
        ticket.user_id,
        'Ticket Updated',
        `Your ticket has been ${status}`,
        { type: 'support_ticket', ticket_id: ticketId }
      );
    }

    return ticket;
  }
};