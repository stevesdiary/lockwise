import { Request, Response } from 'express';
import { CommunityMessage } from '../models/community-message.model';
import { MessageReaction } from '../models/message-reaction.model';
import { User } from '../../auth/models/user.model';
import { uploadService } from '../../upload/services/upload.service';
import { pushNotificationService } from '../services/push-notification.service';

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
            title: msg.title,
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
      const newMessage = await createCommunityMessage(req);
      res.json({ success: true, data: newMessage });
    } catch (error) {
      console.error('Send message error:', error);
      const statusCode = (error as any)?.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: statusCode === 400 ? (error as Error).message : 'Failed to send message',
      });
    }
  },

  async sendMessageWithFile(req: Request, res: Response) {
    try {
      const newMessage = await createCommunityMessage(req);
      res.json({ success: true, data: newMessage });
    } catch (error) {
      console.error('Send message with file error:', error);
      const statusCode = (error as any)?.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: statusCode === 400 ? (error as Error).message : 'Failed to send message',
      });
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
        where: { message_id: messageId, user_id: user.id },
      });

      if (existingReaction) {
        if (existingReaction.emoji === emoji) {
          await existingReaction.destroy();
          return res.json({ success: true, message: 'Reaction removed' });
        }
        await existingReaction.update({ emoji });
        return res.json({ success: true, message: 'Reaction updated' });
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

  async removeReaction(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { messageId, emoji } = req.params;

      const reaction = await MessageReaction.findOne({
        where: { message_id: messageId, user_id: user.id, emoji: decodeURIComponent(String(emoji)) },
      });

      if (!reaction) {
        return res.status(404).json({ success: false, error: 'Reaction not found' });
      }

      await reaction.destroy();
      res.json({ success: true, message: 'Reaction removed' });
    } catch (error) {
      console.error('Remove reaction error:', error);
      res.status(500).json({ success: false, error: 'Failed to remove reaction' });
    }
  },

  async sendAnnouncement(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { message, title } = req.body;

      if (user.role !== 'admin' && user.role !== 'manager') {
        return res.status(403).json({ success: false, error: 'Unauthorized' });
      }

      const announcement = await CommunityMessage.create({
        estate_id: user.estate_id,
        user_id: user.id,
        message: message.trim(),
        is_announcement: true,
        title: title?.trim() || null,
      });

      pushNotificationService.sendEmergencyAlert(
        user.estate_id,
        `📢 ${title?.trim() || 'New Announcement'}: ${message.trim()}`
      ).catch(() => {});

      res.json({ success: true, data: announcement });
    } catch (error) {
      console.error('Send announcement error:', error);
      res.status(500).json({ success: false, error: 'Failed to send announcement' });
    }
  },
};

async function createCommunityMessage(req: Request) {
  const user = (req as any).user;
  const file = req.file;
  const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';

  let fileUrl = req.body?.file_url || null;
  let fileName = req.body?.file_name || null;
  let fileType = req.body?.file_type || null;
  let fileSize = req.body?.file_size || null;

  if (file) {
    const uploadResult = await uploadService.uploadFile(file, user.estate_id, 'community');
    fileUrl = uploadResult.url;
    fileName = file.originalname;
    fileType = file.mimetype;
    fileSize = file.size;
  }

  if (!message && !fileUrl) {
    const error = new Error('Message or file attachment is required');
    (error as any).statusCode = 400;
    throw error;
  }

  return CommunityMessage.create({
    estate_id: user.estate_id,
    user_id: user.id,
    message,
    file_url: fileUrl,
    file_name: fileName,
    file_type: fileType,
    file_size: fileSize,
    is_announcement: false,
  });
}
