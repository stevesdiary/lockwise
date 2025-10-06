import { Router } from 'express';
import communityBoardController from '../controllers/community.board.controller';
import { authenticateJWT } from '../middlewares/authentication';

const router = Router();

// General posts
router.get('/posts', 
  authenticateJWT,
  communityBoardController.getPosts
);

router.post('/posts', 
  authenticateJWT,
  communityBoardController.createPost
);

router.post('/posts/:postId/comments', 
  authenticateJWT,
  communityBoardController.addComment
);

// Chat functionality
router.get('/chat', 
  authenticateJWT,
  communityBoardController.getChatMessages
);

router.post('/chat', 
  authenticateJWT,
  communityBoardController.sendChatMessage
);

// Announcements
router.post('/announcements', 
  authenticateJWT,
  communityBoardController.createAnnouncement
);

// Meetings
router.post('/meetings', 
  authenticateJWT,
  communityBoardController.createMeeting
);

export default router;