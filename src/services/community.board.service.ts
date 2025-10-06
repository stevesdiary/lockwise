import { CommunityPost, CommunityComment } from '../models/community.board.model';
import { User } from '../models/user.model';
import { Op } from 'sequelize';

class CommunityBoardService {
  async createPost(data: {
    estate_id: string;
    user_id: string;
    type: string;
    title?: string;
    content: string;
    attachments?: any;
  }) {
    return await CommunityPost.create(data);
  }

  async getEstatePosts(estateId: string, type?: string, limit: number = 50) {
    const whereClause: any = { estate_id: estateId };
    if (type) whereClause.type = type;

    return await CommunityPost.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: CommunityComment,
          include: [{
            model: User,
            attributes: ['id', 'first_name', 'last_name']
          }],
          limit: 5,
          order: [['created_at', 'DESC']]
        }
      ],
      order: [
        ['is_pinned', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit
    });
  }

  async addComment(postId: string, userId: string, content: string) {
    return await CommunityComment.create({
      post_id: postId,
      user_id: userId,
      content
    });
  }

  async pinPost(postId: string, estateId: string) {
    const [updatedCount] = await CommunityPost.update(
      { is_pinned: true },
      { where: { id: postId, estate_id: estateId } }
    );
    return updatedCount > 0;
  }

  async unpinPost(postId: string, estateId: string) {
    const [updatedCount] = await CommunityPost.update(
      { is_pinned: false },
      { where: { id: postId, estate_id: estateId } }
    );
    return updatedCount > 0;
  }

  async deletePost(postId: string, userId: string, estateId: string) {
    const deletedCount = await CommunityPost.destroy({
      where: { id: postId, user_id: userId, estate_id: estateId }
    });
    return deletedCount > 0;
  }

  async createAnnouncement(estateId: string, userId: string, title: string, content: string) {
    return await this.createPost({
      estate_id: estateId,
      user_id: userId,
      type: 'announcement',
      title,
      content
    });
  }

  async createMeeting(estateId: string, userId: string, title: string, content: string, meetingData: any) {
    return await this.createPost({
      estate_id: estateId,
      user_id: userId,
      type: 'meeting',
      title,
      content,
      attachments: meetingData
    });
  }

  async getChatMessages(estateId: string, limit: number = 100) {
    return await CommunityPost.findAll({
      where: { estate_id: estateId, type: 'chat' },
      include: [{
        model: User,
        attributes: ['id', 'first_name', 'last_name']
      }],
      order: [['created_at', 'ASC']],
      limit
    });
  }

  async sendChatMessage(estateId: string, userId: string, message: string) {
    return await this.createPost({
      estate_id: estateId,
      user_id: userId,
      type: 'chat',
      content: message
    });
  }
}

export default new CommunityBoardService();