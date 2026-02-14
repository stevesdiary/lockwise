import { Request, Response } from 'express';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';
import { SupportTicket, SupportMessage } from '../../support/models/support.model';
import { User } from '../../auth/models/user.model';
import { Op } from 'sequelize';

class AdminSupportController {
  async getAllTickets(req: Request, res: Response) {
    try {
      const { status, priority, category, page = 1, limit = 20 } = req.query;
      const whereClause: any = {};

      if (status) whereClause.status = status;
      if (priority) whereClause.priority = priority;
      if (category) whereClause.category = category;

      const tickets = await SupportTicket.findAndCountAll({
        where: whereClause,
        include: [
          { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] },
          { model: User, as: 'assignee', attributes: ['id', 'first_name', 'last_name'] }
        ],
        order: [['created_at', 'DESC']],
        limit: parseInt(limit as string),
        offset: (parseInt(page as string) - 1) * parseInt(limit as string)
      });

      return res.status(200).json({
        status: 'success',
        data: {
          tickets: tickets.rows,
          pagination: {
            total: tickets.count,
            page: parseInt(page as string),
            pages: Math.ceil(tickets.count / parseInt(limit as string))
          }
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async assignTicket(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { assigned_to } = req.body;
      const adminId = req.user?.id;

      const [updatedCount] = await SupportTicket.update(
        { assigned_to, status: 'in_progress' },
        { where: { id: ticketId } }
      );

      if (updatedCount === 0) {
        return res.status(404).json({
          status: 'fail',
          message: 'Ticket not found'
        });
      }

      // Add internal message
      await SupportMessage.create({
        ticket_id: ticketId,
        user_id: adminId,
        message: `Ticket assigned to support agent`,
        is_internal: true
      });

      return res.status(200).json({
        status: 'success',
        message: 'Ticket assigned successfully'
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async updateTicketStatus(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { status } = req.body;
      const adminId = req.user?.id;

      const updateData: any = { status };
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date();
      }

      const [updatedCount] = await SupportTicket.update(
        updateData,
        { where: { id: ticketId } }
      );

      if (updatedCount === 0) {
        return res.status(404).json({
          status: 'fail',
          message: 'Ticket not found'
        });
      }

      // Add internal message
      await SupportMessage.create({
        ticket_id: ticketId,
        user_id: adminId,
        message: `Ticket status changed to: ${status}`,
        is_internal: true
      });

      return res.status(200).json({
        status: 'success',
        message: 'Ticket status updated successfully'
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async addAdminMessage(req: Request, res: Response) {
    try {
      const { ticketId } = req.params;
      const { message, is_internal = false } = req.body;
      const adminId = req.user?.id;

      const supportMessage = await SupportMessage.create({
        ticket_id: ticketId,
        user_id: adminId,
        message,
        is_internal
      });

      return res.status(201).json({
        status: 'success',
        data: supportMessage
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getTicketStats(req: Request, res: Response) {
    try {
      const [totalTickets, openTickets, inProgressTickets, resolvedTickets] = await Promise.all([
        SupportTicket.count(),
        SupportTicket.count({ where: { status: 'open' } }),
        SupportTicket.count({ where: { status: 'in_progress' } }),
        SupportTicket.count({ where: { status: 'resolved' } })
      ]);

      return res.status(200).json({
        status: 'success',
        data: {
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          closedTickets: totalTickets - openTickets - inProgressTickets - resolvedTickets
        }
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async searchTickets(req: Request, res: Response) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          status: 'fail',
          message: 'Search query is required'
        });
      }

      const tickets = await SupportTicket.findAll({
        where: {
          [Op.or]: [
            { subject: { [Op.iLike]: `%${query}%` } },
            { description: { [Op.iLike]: `%${query}%` } }
          ]
        },
        include: [
          { model: User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] }
        ],
        order: [['created_at', 'DESC']],
        limit: 50
      });

      return res.status(200).json({
        status: 'success',
        data: tickets
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new AdminSupportController();