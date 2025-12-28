import { Request, Response } from 'express';
import { webSocketService } from '../core';

interface ChatMessage {
  id: string;
  chatId: string;
  message: string;
  senderId: string;
  timestamp: Date;
  type: 'user' | 'support';
}

const chatController = {
  
  createSupportChat: async (req: Request, res: Response) => {
    try {
      const { userId, subject } = req.body;
      const chatId = `chat_${userId}_${Date.now()}`;
      
      // Notify staff of new chat
      webSocketService.broadcastToStaff('new_support_chat', {
        chatId,
        userId,
        subject,
        timestamp: new Date()
      });

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

  sendMessage: async (req: Request, res: Response) => {
    try {
      const { chatId, message, senderId } = req.body;
      
      const messageData: ChatMessage = {
        id: Date.now().toString(),
        chatId,
        message,
        senderId,
        timestamp: new Date(),
        type: req.body.type || 'user'
      };

      webSocketService.sendChatMessage(chatId, messageData);

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

  getChatHistory: async (req: Request, res: Response) => {
    try {
      const { chatId } = req.params;
      
      // In a real implementation, fetch from database
      // For now, return empty array as messages are handled real-time
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