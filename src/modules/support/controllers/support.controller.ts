import { Response } from 'express';
import { supportService } from '../../support/services/support.service';
import { AuthRequest } from '../../auth/middleware/auth.middleware';
import { asString } from '../../../shared/utils/param.util';

export const supportController = {
  async createTicket(req: AuthRequest, res: Response) {
    try {
      const { subject, description, category, priority } = req.body;
      const ticket = await supportService.createTicket(req.user!.id, {
        subject,
        description,
        category,
        priority
      });

      res.status(201).json({ message: 'Ticket created', data: ticket });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create ticket' });
    }
  },

  async getSupportInfo(req: AuthRequest, res: Response) {
    try {
      const estateId = req.user?.estate_id;
      const data = await supportService.getSupportInfo(estateId);

      res.json({
        success: true,
        data
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch support info' });
    }
  },

  async getMyTickets(req: AuthRequest, res: Response) {
    try {
      const tickets = await supportService.getUserTickets(req.user!.id);
      res.json({ data: tickets });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch tickets' });
    }
  },

  async getOpenTickets(req: AuthRequest, res: Response) {
    try {
      const tickets = await supportService.getOpenTickets();
      res.json({ data: tickets });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch open tickets' });
    }
  },

  async getAgentTickets(req: AuthRequest, res: Response) {
    try {
      const tickets = await supportService.getAgentTickets(req.user!.id);
      res.json({ data: tickets });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch agent tickets' });
    }
  },

  async assignTicket(req: AuthRequest, res: Response) {
    try {
      const ticketId = asString(req.params.ticketId);
      const ticket = await supportService.assignTicket(ticketId, req.user!.id);
      res.json({ message: 'Ticket assigned', data: ticket });
    } catch (error) {
      res.status(500).json({ error: 'Failed to assign ticket' });
    }
  },

  async sendMessage(req: AuthRequest, res: Response) {
    try {
      const ticketId = asString(req.params.ticketId);
      const { message, is_internal } = req.body;
      const file = req.file;
      
      // Validate file type if file is uploaded
      if (file) {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];
        
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return res.status(400).json({ 
            error: 'Invalid file type. Only images (jpg, jpeg, png) and documents (pdf, doc, docx) are allowed.' 
          });
        }
      }
      
      const msg = await supportService.sendMessage(
        ticketId,
        req.user!.id,
        message,
        is_internal || false,
        file
      );

      res.status(201).json({ message: 'Message sent', data: msg });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send message' });
    }
  },

  async getMessages(req: AuthRequest, res: Response) {
    try {
      const ticketId = asString(req.params.ticketId);
      const messages = await supportService.getTicketMessages(ticketId, req.user!.id);
      res.json({ data: messages });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  },

  async updateStatus(req: AuthRequest, res: Response) {
    try {
      const ticketId = asString(req.params.ticketId);
      const { status } = req.body;
      
      const ticket = await supportService.updateTicketStatus(ticketId, status);
      res.json({ message: 'Status updated', data: ticket });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update status' });
    }
  }
};