import Bull from 'bull';
import EmailService from '../../communication/services/email.service';
import SMSService from './sms.service';

interface NotificationJob {
  type: 'email' | 'sms';
  to: string;
  template: string;
  data: any;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

class NotificationService {
  private emailQueue: Bull.Queue;
  private smsQueue: Bull.Queue;

  constructor() {
    const redisConfig = {
      redis: {
        host: process.env.REDIS_HOST?.split(':')[0] || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
      },
    };

    this.emailQueue = new Bull('email notifications', redisConfig);
    this.smsQueue = new Bull('sms notifications', redisConfig);

    this.setupProcessors();
  }

  private setupProcessors() {
    // Email processor
    this.emailQueue.process(async (job) => {
      const { to, template, data } = job.data;
      console.log(`Processing email job: ${template} to ${to}`);
      
      const success = await EmailService.sendEmail({ to, template, data });
      if (!success) {
        throw new Error('Email sending failed');
      }
      
      return { success: true, timestamp: new Date() };
    });

    // SMS processor
    this.smsQueue.process(async (job) => {
      const { to, template, data } = job.data;
      console.log(`Processing SMS job: ${template} to ${to}`);
      
      const success = await SMSService.sendSMS({ to, template, data });
      if (!success) {
        throw new Error('SMS sending failed');
      }
      
      return { success: true, timestamp: new Date() };
    });

    // Error handling
    this.emailQueue.on('failed', (job, err) => {
      console.error(`Email job ${job.id} failed:`, err);
    });

    this.smsQueue.on('failed', (job, err) => {
      console.error(`SMS job ${job.id} failed:`, err);
    });
  }

  private getPriority(priority: string = 'normal'): number {
    const priorities = { low: 10, normal: 0, high: -5, critical: -10 };
    return priorities[priority as keyof typeof priorities] || 0;
  }

  async sendNotification(notification: NotificationJob): Promise<void> {
    const options = {
      priority: this.getPriority(notification.priority),
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    };

    if (notification.type === 'email') {
      await this.emailQueue.add(notification, options);
    } else {
      await this.smsQueue.add(notification, options);
    }
  }

  // Convenience methods
  async sendWelcomeNotifications(email: string, phone: string, name: string, estate_name?: string): Promise<void> {
    await Promise.all([
      this.sendNotification({
        type: 'email',
        to: email,
        template: 'welcome',
        data: { name, estate_name },
        priority: 'high'
      }),
      this.sendNotification({
        type: 'sms',
        to: phone,
        template: 'verification',
        data: { name, code: '123456' }, // This should be actual verification code
        priority: 'high'
      })
    ]);
  }

  async sendVerificationNotifications(email: string, phone: string, name: string, code: string): Promise<void> {
    await Promise.all([
      this.sendNotification({
        type: 'email',
        to: email,
        template: 'verification',
        data: { name, code },
        priority: 'critical'
      }),
      this.sendNotification({
        type: 'sms',
        to: phone,
        template: 'verification',
        data: { name, code },
        priority: 'critical'
      })
    ]);
  }

  async sendAccessCodeNotifications(email: string, phone: string, name: string, access_code: string, valid_until: string): Promise<void> {
    await Promise.all([
      this.sendNotification({
        type: 'email',
        to: email,
        template: 'accessCode',
        data: { name, access_code, valid_until },
        priority: 'high'
      }),
      this.sendNotification({
        type: 'sms',
        to: phone,
        template: 'accessCode',
        data: { name, access_code, valid_until },
        priority: 'high'
      })
    ]);
  }

  async sendPaymentNotifications(email: string, phone: string, name: string, amount: string, success: boolean, reference?: string): Promise<void> {
    const template = success ? 'paymentSuccess' : 'paymentFailed';
    const data = success ? { name, amount, reference } : { name, amount };

    await Promise.all([
      this.sendNotification({
        type: 'email',
        to: email,
        template,
        data,
        priority: 'high'
      }),
      this.sendNotification({
        type: 'sms',
        to: phone,
        template: success ? 'paymentSuccess' : 'paymentFailed',
        data: { name, amount },
        priority: 'high'
      })
    ]);
  }

  async sendEmergencyAlert(contacts: Array<{email: string, phone: string}>, alert_type: string, location: string): Promise<void> {
    const notifications = contacts.flatMap(contact => [
      this.sendNotification({
        type: 'email',
        to: contact.email,
        template: 'emergencyAlert',
        data: { alert_type, location },
        priority: 'critical'
      }),
      this.sendNotification({
        type: 'sms',
        to: contact.phone,
        template: 'emergencyAlert',
        data: { alert_type, location },
        priority: 'critical'
      })
    ]);

    await Promise.all(notifications);
  }

  async getQueueStats() {
    const [emailStats, smsStats] = await Promise.all([
      {
        waiting: await this.emailQueue.getWaiting(),
        active: await this.emailQueue.getActive(),
        completed: await this.emailQueue.getCompleted(),
        failed: await this.emailQueue.getFailed(),
      },
      {
        waiting: await this.smsQueue.getWaiting(),
        active: await this.smsQueue.getActive(),
        completed: await this.smsQueue.getCompleted(),
        failed: await this.smsQueue.getFailed(),
      }
    ]);

    return {
      email: {
        waiting: emailStats.waiting.length,
        active: emailStats.active.length,
        completed: emailStats.completed.length,
        failed: emailStats.failed.length,
      },
      sms: {
        waiting: smsStats.waiting.length,
        active: smsStats.active.length,
        completed: smsStats.completed.length,
        failed: smsStats.failed.length,
      }
    };
  }
}

export default new NotificationService();