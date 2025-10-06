import { Request, Response } from 'express';
import { handleControllerError } from '../middlewares/error.handler';
import { SupportTicket, SupportMessage } from '../models/support.model';
import { User } from '../models/user.model';

class SupportController {
  async createTicket(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { subject, description, category, priority } = req.body;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const ticket = await SupportTicket.create({
        user_id: userId,
        subject,
        description,
        category,
        priority: priority || 'medium'
      });

      return res.status(201).json({
        status: 'success',
        data: ticket
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getUserTickets(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const tickets = await SupportTicket.findAll({
        where: { user_id: userId },
        include: [{
          model: SupportMessage,
          include: [{ model: User, attributes: ['first_name', 'last_name'] }],
          limit: 5,
          order: [['created_at', 'DESC']]
        }],
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json({
        status: 'success',
        data: tickets
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getTicketMessages(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { ticketId } = req.params;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const messages = await SupportMessage.findAll({
        where: { ticket_id: ticketId },
        include: [{ model: User, attributes: ['first_name', 'last_name'] }],
        order: [['created_at', 'ASC']]
      });

      return res.status(200).json({
        status: 'success',
        data: messages
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async addMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { ticketId } = req.params;
      const { message } = req.body;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const supportMessage = await SupportMessage.create({
        ticket_id: ticketId,
        user_id: userId,
        message,
        is_internal: false
      });

      return res.status(201).json({
        status: 'success',
        data: supportMessage
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new SupportController();