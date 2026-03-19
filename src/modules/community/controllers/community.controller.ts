import { Request, Response } from 'express';
import { CommunityMessage } from '../models/community-message.model';
import { MessageReaction } from '../models/message-reaction.model';
import { User } from '../../auth';
import { uploadService } from '../../upload/services/upload.service';
import sequelize from '../../../shared/core/database';

export const communityController = {
  async getMessages(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const estateId = user.estate_id;

      const messages = await CommunityMessage.findAll({
        where: { estate_id: estateId },
        include: [
          {
            model: User,
            attributes: ['id', 'first_name', 'last_name'],
          },
        ],
        order: [['created_at', 'ASC']],
        limit: 100,
      });

      const messagesWithReactions = await Promise.all(
        messages.map(async (msg) => {
          const reactions = await MessageReaction.findAll({
            where: { message_id: msg.id },
            include: [{ model: User, attributes: ['id', 'first_name', 'last_name'] }],
          });

          const reactionGroups = reactions.reduce((acc: any, reaction: any) => {
            const emoji = reaction.emoji;
            if (!acc[emoji]) {
              acc[emoji] = { emoji, count: 0, users: [] };
            }
            acc[emoji].count++;
            acc[emoji].users.push(reaction.user_id);
            return acc;
          }, {});

          return {
            id: msg.id,
            user_id: msg.user_id,
            user_name: `${(msg.user as any).first_name} ${(msg.user as any).last_name}`,
            message: msg.message,
            file_url: msg.file_url,
            file_name: msg.file_name,
            file_type: msg.file_type,
            is_announcement: msg.is_announcement,
            created_at: msg.createdAt,
            reactions: Object.values(reactionGroups),
          };
        })
      );

      res.json({ success: true, data: messagesWithReactions });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch messages' });
    }
  },

  async sendMessage(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, error: 'Message is required' });
      }

      const newMessage = await CommunityMessage.create({
        estate_id: user.estate_id,
        user_id: user.id,
        message: message.trim(),
        is_announcement: false,
      });

      res.json({ success: true, data: newMessage });
    } catch (error) {
      console.error('Send message error:', error);
      res.status(500).json({ success: false, error: 'Failed to send message' });
    }
  },

  async sendMessageWithFile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { message } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, error: 'File is required' });
      }

      const uploadResult = await uploadService.uploadFile(file, user.estate_id, 'community');

      const newMessage = await CommunityMessage.create({
        estate_id: user.estate_id,
        user_id: user.id,
        message: message?.trim() || '',
        file_url: uploadResult.url,
        file_name: file.originalname,
        file_type: file.mimetype,
        file_size: file.size,
        is_announcement: false,
      });

      res.json({ success: true, data: newMessage });
    } catch (error) {
      console.error('Send message with file error:', error);
      res.status(500).json({ success: false, error: 'Failed to send message' });
    }
  },

  async addReaction(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { messageId } = req.params;
      const { emoji } = req.body;

      if (!emoji) {
        return res.status(400).json({ success: false, error: 'Emoji is required' });
      }

      const existingReaction = await MessageReaction.findOne({
        where: { message_id: messageId, user_id: user.id, emoji },
      });

      if (existingReaction) {
        await existingReaction.destroy();
        return res.json({ success: true, message: 'Reaction removed' });
      }

      await MessageReaction.create({
        message_id: messageId,
        user_id: user.id,
        emoji,
      });

      res.json({ success: true, message: 'Reaction added' });
    } catch (error) {
      console.error('Add reaction error:', error);
      res.status(500).json({ success: false, error: 'Failed to add reaction' });
    }
  },

  async sendAnnouncement(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { message } = req.body;

      if (user.role !== 'admin' && user.role !== 'manager') {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }

      const announcement = await CommunityMessage.create({
        estate_id: user.estate_id,
        user_id: user.id,
        message: message.trim(),
        is_announcement: true,
      });

      res.json({ success: true, data: announcement });
    } catch (error) {
      console.error('Send announcement error:', error);
      res.status(500).json({ success: false, error: 'Failed to send announcement' });
    }
  },
};
