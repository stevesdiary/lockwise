import { Router } from 'express';
import communityBoardController from '../controllers/community.board.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const router = Router();

// General posts
router.get('/posts', 
  authenticateToken,
  communityBoardController.getPosts
);

router.post('/posts', 
  authenticateToken,
  communityBoardController.createPost
);

router.post('/posts/:postId/comments', 
  authenticateToken,
  communityBoardController.addComment
);

// Chat functionality
router.get('/chat', 
  authenticateToken,
  communityBoardController.getChatMessages
);

router.post('/chat', 
  authenticateToken,
  communityBoardController.sendChatMessage
);

// Announcements
router.post('/announcements', 
  authenticateToken,
  communityBoardController.createAnnouncement
);

// Meetings
router.post('/meetings', 
  authenticateToken,
  communityBoardController.createMeeting
);

export default router;