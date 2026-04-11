import { Router, Request, Response } from 'express';
import { Receiver } from '@upstash/qstash';
import NotificationService from '../../communication/services/notification.service';
import webPushService from '../../communication/services/web-push.service';

const workerRouter = Router();

const receiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

async function verifyQStash(req: Request, res: Response): Promise<boolean> {
  // In development, allow requests with a local dev secret to bypass QStash signature
  if (process.env.NODE_ENV !== 'production' && req.headers['x-worker-secret'] === process.env.WORKER_SECRET) {
    return true;
  }
  try {
    const signature = req.headers['upstash-signature'] as string;
    const rawBody = JSON.stringify(req.body);
    const isValid = await receiver.verify({ signature, body: rawBody });
    if (!isValid) {
      res.status(401).json({ error: 'Invalid QStash signature' });
      return false;
    }
    return true;
  } catch {
    res.status(401).json({ error: 'Signature verification failed' });
    return false;
  }
}

workerRouter.post('/email-notifications', async (req: Request, res: Response) => {
  if (!await verifyQStash(req, res)) return;
  try {
    await NotificationService.processEmailJob(req.body);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Email worker error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

workerRouter.post('/sms-notifications', async (req: Request, res: Response) => {
  if (!await verifyQStash(req, res)) return;
  try {
    await NotificationService.processSMSJob(req.body);
    res.json({ success: true });
  } catch (error: any) {
    console.error('SMS worker error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// { userIds: string[], title: string, body: string, url?: string, tag?: string }
workerRouter.post('/web-push', async (req: Request, res: Response) => {
  if (!await verifyQStash(req, res)) return;
  try {
    const { userIds, ...payload } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'userIds required' });
    }
    await webPushService.sendToUsers(userIds, payload);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Web push worker error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

export default workerRouter;
