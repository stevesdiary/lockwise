import { Router, Request, Response } from 'express';
import { PushSubscription } from 'web-push';
import webPushService from '../services/web-push.service';
import { authenticateToken } from '../../auth/middleware/auth.middleware';

const webPushRouter = Router();

/** GET /push/vapid-public-key — frontend fetches this to register its service worker */
webPushRouter.get('/vapid-public-key', (_req: Request, res: Response) => {
  res.json({ publicKey: webPushService.getVapidPublicKey() });
});

/** POST /push/subscribe — browser sends its PushSubscription object after user grants permission */
webPushRouter.post('/subscribe', authenticateToken as any, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const subscription: PushSubscription = req.body;

  if (!subscription?.endpoint) {
    return res.status(400).json({ success: false, message: 'Invalid push subscription' });
  }

  await webPushService.saveSubscription(userId, subscription);
  res.json({ success: true, message: 'Push subscription saved' });
});

/** DELETE /push/unsubscribe — remove subscription on logout or permission revoke */
webPushRouter.delete('/unsubscribe', authenticateToken as any, async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  await webPushService.removeSubscription(userId);
  res.json({ success: true, message: 'Push subscription removed' });
});

export default webPushRouter;
