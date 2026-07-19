import { Router } from 'express';
import communityBoardController from '../controllers/community.board.controller';
import { authenticateToken } from '../../../shared/middleware/auth.middleware';

const router = Router();

// CSRF Protection: All POST routes use JWT tokens in Authorization header (not cookies)
// which inherently protects against CSRF attacks as browsers don't auto-send custom headers

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