import { Router } from 'express';
import { communityController } from '../controllers/community.controller';
import { authenticateToken } from '../../auth/middleware/auth.middleware';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/messages', authenticateToken, communityController.getMessages);
router.post('/messages', authenticateToken, upload.single('file'), communityController.sendMessage);
router.post('/messages/file', authenticateToken, upload.single('file'), communityController.sendMessageWithFile);
router.post('/messages/:messageId/reactions', authenticateToken, communityController.addReaction);
router.delete('/messages/:messageId/reactions/:emoji', authenticateToken, communityController.removeReaction);
router.post('/announcements', authenticateToken, communityController.sendAnnouncement);

export default router;
