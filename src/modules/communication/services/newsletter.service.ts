import { NewsletterSubscriber } from '../models/newsletter.model';
import EmailService from './email.service';

class NewsletterService {
  async subscribe(email: string, firstName?: string, source?: string): Promise<{ subscriber: NewsletterSubscriber; isNew: boolean }> {
    const existing = await NewsletterSubscriber.findOne({ where: { email: email.toLowerCase().trim() } });

    if (existing) {
      if (existing.status === 'subscribed') {
        return { subscriber: existing, isNew: false };
      }
      await existing.update({
        status: 'subscribed',
        first_name: firstName || existing.first_name,
        source: source || existing.source,
        subscribed_at: new Date(),
        unsubscribed_at: null,
      });
      return { subscriber: existing, isNew: false };
    }

    const subscriber = await NewsletterSubscriber.create({
      email: email.toLowerCase().trim(),
      first_name: firstName || null,
      status: 'subscribed',
      source: source || 'landing_page',
    } as any);

    return { subscriber, isNew: true };
  }

  async unsubscribe(email: string): Promise<boolean> {
    const subscriber = await NewsletterSubscriber.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!subscriber || subscriber.status === 'unsubscribed') return false;

    await subscriber.update({
      status: 'unsubscribed',
      unsubscribed_at: new Date(),
    });
    return true;
  }

  async getSubscribers(filters: { status?: string; page?: number; limit?: number } = {}) {
    const { status, page = 1, limit = 20 } = filters;
    const where: any = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;
    const { rows, count } = await NewsletterSubscriber.findAndCountAll({
      where,
      order: [['subscribed_at', 'DESC']],
      limit,
      offset,
    });

    return {
      subscribers: rows,
      pagination: {
        total: count,
        page,
        limit,
        pages: Math.ceil(count / limit),
      },
    };
  }

  async getStats() {
    const total = await NewsletterSubscriber.count();
    const subscribed = await NewsletterSubscriber.count({ where: { status: 'subscribed' } });
    const unsubscribed = await NewsletterSubscriber.count({ where: { status: 'unsubscribed' } });

    return { total, subscribed, unsubscribed };
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    try {
      await EmailService.sendEmail({
        to: email,
        template: 'newsletterWelcome',
        data: { name: firstName || 'there' },
      });
    } catch {
      // fire-and-forget — don't fail subscription over email
    }
  }
}

export default new NewsletterService();
