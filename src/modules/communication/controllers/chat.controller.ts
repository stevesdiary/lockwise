import { Request, Response } from 'express';
import fileUploadService from '../../upload/services/file-upload.service';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';
// import { webSocketService } from '../../../shared/core';

interface ChatAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
}

interface ChatMessage {
  id: string;
  chatId: string;
  message: string;
  senderId: string;
  timestamp: Date;
  type: 'user' | 'support';
  attachments?: ChatAttachment[];
}

const chatController = {
  
  createSupportChat: async (req: Request, res: Response) => {
    try {
      const { userId, subject } = req.body;
      const chatId = `chat_${userId}_${Date.now()}`;
      
      // webSocketService.broadcastToStaff('new_support_chat', {
      //   chatId,
      //   userId,
      //   subject,
      //   timestamp: new Date()
      // });

      return res.status(200).json({
        status: 'success',
        data: { chatId, subject }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to create support chat'
      });
    }
  },

  sendMessage: async (req: AuthRequest, res: Response) => {
    try {
      const { chatId, message } = req.body;
      const senderId = req.user?.id;
      
      if (!senderId) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      let attachments: ChatAttachment[] = [];
      
      // Handle file attachments if present
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        const uploadResults = await fileUploadService.uploadMultipleFiles(
          req.files as Express.Multer.File[],
          `chat/${chatId}`
        );
        
        attachments = uploadResults
          .filter(result => result.success)
          .map((result, index) => ({
            id: Date.now().toString() + index,
            filename: (req.files as Express.Multer.File[])[index].originalname,
            url: result.url!,
            size: (req.files as Express.Multer.File[])[index].size,
            mimeType: (req.files as Express.Multer.File[])[index].mimetype
          }));
      }
      
      const messageData: ChatMessage = {
        id: Date.now().toString(),
        chatId,
        message: message || '',
        senderId,
        timestamp: new Date(),
        type: req.body.type || 'user',
        attachments: attachments.length > 0 ? attachments : undefined
      };

      // webSocketService.sendChatMessage(chatId, messageData);

      return res.status(200).json({
        status: 'success',
        data: messageData
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send message'
      });
    }
  },

  getChatHistory: async (req: AuthRequest, res: Response) => {
    try {
      const { chatId } = req.params;
      
      return res.status(200).json({
        status: 'success',
        data: []
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to get chat history'
      });
    }
  }
};

export default chatController;