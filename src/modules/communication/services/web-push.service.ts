import webpush, { PushSubscription } from 'web-push';
import redis from '../../../shared/core/redis';

const VAPID_PUBLIC_KEY  = process.env.VAPID_PUBLIC_KEY!;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
const VAPID_SUBJECT     = process.env.VAPID_SUBJECT || 'mailto:admin@lockwise.app';

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Redis key: push_sub:<userId>  →  JSON-serialised PushSubscription
const subKey = (userId: string) => `push_sub:${userId}`;

export interface WebPushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
}

class WebPushService {
  /** Save or replace a browser push subscription for a user */
  async saveSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    // 90-day TTL — subscription expires if user never re-visits the dashboard
    await redis.set(subKey(userId), JSON.stringify(subscription), { ex: 60 * 60 * 24 * 90 });
  }

  /** Remove a push subscription (user revoked permission or logged out) */
  async removeSubscription(userId: string): Promise<void> {
    await redis.del(subKey(userId));
  }

  /** Send a web push to a single user by their userId */
  async sendToUser(userId: string, payload: WebPushPayload): Promise<void> {
    const raw = await redis.get(subKey(userId)) as string | null;
    if (!raw) return; // user hasn't subscribed from a browser

    let subscription: PushSubscription;
    try {
      subscription = typeof raw === 'string' ? JSON.parse(raw) : raw as PushSubscription;
    } catch {
      return;
    }

    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (err: any) {
      // 410 Gone = subscription is no longer valid; clean it up
      if (err.statusCode === 410) {
        await this.removeSubscription(userId);
      }
    }
  }

  /** Broadcast to multiple users (e.g., all admins) */
  async sendToUsers(userIds: string[], payload: WebPushPayload): Promise<void> {
    await Promise.allSettled(userIds.map(id => this.sendToUser(id, payload)));
  }

  getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY;
  }
}

export default new WebPushService();
