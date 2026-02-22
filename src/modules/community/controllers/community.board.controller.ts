import { Request, Response } from 'express';
import { handleControllerError } from '../../../shared/middleware/error-handler.middleware';
import communityBoardService from '../services/community.board.service';
import { asString } from '../../../shared/utils/param.util';

class CommunityBoardController {
  async getPosts(req: Request, res: Response) {
    try {
      const estateId = req.user?.estate_id;
      const { type, limit } = req.query;

      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }

      const posts = await communityBoardService.getEstatePosts(
        estateId,
        type as string,
        parseInt(limit as string) || 50
      );

      return res.status(200).json({
        status: 'success',
        data: posts
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async createPost(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const estateId = req.user?.estate_id;
      const { type, title, content, attachments } = req.body;

      if (!userId || !estateId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const post = await communityBoardService.createPost({
        estate_id: estateId,
        user_id: userId,
        type,
        title,
        content,
        attachments
      });

      return res.status(201).json({
        status: 'success',
        data: post
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async addComment(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const postId = asString(req.params.postId);
      const { content } = req.body;

      if (!userId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const comment = await communityBoardService.addComment(postId, userId, content);

      return res.status(201).json({
        status: 'success',
        data: comment
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async getChatMessages(req: Request, res: Response) {
    try {
      const estateId = req.user?.estate_id;
      const { limit } = req.query;

      if (!estateId) {
        return res.status(400).json({
          status: 'fail',
          message: 'Estate ID is required'
        });
      }

      const messages = await communityBoardService.getChatMessages(
        estateId,
        parseInt(limit as string) || 100
      );

      return res.status(200).json({
        status: 'success',
        data: messages
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async sendChatMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const estateId = req.user?.estate_id;
      const { message } = req.body;

      if (!userId || !estateId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const chatMessage = await communityBoardService.sendChatMessage(estateId, userId, message);

      return res.status(201).json({
        status: 'success',
        data: chatMessage
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async createAnnouncement(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const estateId = req.user?.estate_id;
      const { title, content } = req.body;

      if (!userId || !estateId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const announcement = await communityBoardService.createAnnouncement(estateId, userId, title, content);

      return res.status(201).json({
        status: 'success',
        data: announcement
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }

  async createMeeting(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const estateId = req.user?.estate_id;
      const { title, content, meeting_date, meeting_link } = req.body;

      if (!userId || !estateId) {
        return res.status(401).json({
          status: 'fail',
          message: 'User not authenticated'
        });
      }

      const meeting = await communityBoardService.createMeeting(estateId, userId, title, content, {
        meeting_date,
        meeting_link
      });

      return res.status(201).json({
        status: 'success',
        data: meeting
      });
    } catch (error) {
      return handleControllerError(error, res);
    }
  }
}

export default new CommunityBoardController();
