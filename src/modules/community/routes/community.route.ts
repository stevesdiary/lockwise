import { Router } from 'express';
import { communityController } from '../controllers/community.controller';
import { authenticateToken } from '../../../shared/middleware/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/messages', authenticateToken, communityController.getMessages);
router.post('/messages', authenticateToken, communityController.sendMessage);
router.post('/messages/file', authenticateToken, upload.single('file'), communityController.sendMessageWithFile);
router.post('/messages/:messageId/reactions', authenticateToken, communityController.addReaction);
router.post('/announcements', authenticateToken, communityController.sendAnnouncement);

export default router;
