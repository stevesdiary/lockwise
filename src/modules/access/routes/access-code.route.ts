import { Router } from 'express';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const router = Router();

router.post('/generate', authenticateToken, (req, res) => {
  res.json({ message: 'Access code generated' });
});

router.post('/validate', (req, res) => {
  res.json({ message: 'Access code validated' });
});

export default router;
