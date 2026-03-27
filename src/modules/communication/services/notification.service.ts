import { Client } from '@upstash/qstash';
import EmailService from './email.service';
import SMSService from './sms.service';

interface NotificationJob {
  type: 'email' | 'sms';
  to: string;
  template: string;
  data: any;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

class NotificationService {
  private qstash: Client;
  private workerBaseUrl: string;

  constructor() {
    this.qstash = new Client({ token: process.env.QSTASH_TOKEN! });
    this.workerBaseUrl = process.env.WORKER_BASE_URL || 'http://localhost:3002/api/v1';
  }

  async sendNotification(notification: NotificationJob): Promise<void> {
    const queue = notification.type === 'email' ? 'email-notifications' : 'sms-notifications';
    await this.qstash.publishJSON({
      url: `${this.workerBaseUrl}/workers/${queue}`,
      body: notification,
      retries: 3,
    });
  }

  // Called directly by worker routes — no queue involved
  async processEmailJob(job: NotificationJob): Promise<void> {
    const success = await EmailService.sendEmail({ to: job.to, template: job.template as any, data: job.data });
    if (!success) throw new Error('Email sending failed');
  }

  async processSMSJob(job: NotificationJob): Promise<void> {
    let message = '';
    const d = job.data;
    if (d.code)          message = `${d.name}, your LOCKWISE verification code is: ${d.code}. Valid for 10 minutes.`;
    else if (d.access_code) message = `${d.name}, your LOCKWISE access code is: ${d.access_code}. Valid until: ${d.valid_until}`;
    else if (d.alert_type)  message = `LOCKWISE EMERGENCY ALERT: ${d.alert_type} at ${d.location}. Please respond immediately.`;
    else if (d.amount)      message = `${d.name}, your LOCKWISE payment of ${d.amount} was ${d.reference ? 'successful' : 'failed'}.`;
    else                    message = `LOCKWISE: ${JSON.stringify(d)}`;

    const success = await SMSService.sendSMS(job.to, message);
    if (!success) throw new Error('SMS sending failed');
  }

  async sendWelcomeNotifications(email: string, phone: string, name: string, estate_name?: string): Promise<void> {
    await Promise.all([
      this.sendNotification({ type: 'email', to: email, template: 'welcome', data: { name, estate_name }, priority: 'high' }),
      this.sendNotification({ type: 'sms',   to: phone, template: 'verification', data: { name, code: '123456' }, priority: 'high' }),
    ]);
  }

  async sendVerificationNotifications(email: string, phone: string, name: string, code: string): Promise<void> {
    await Promise.all([
      this.sendNotification({ type: 'email', to: email, template: 'verification', data: { name, code }, priority: 'critical' }),
      this.sendNotification({ type: 'sms',   to: phone, template: 'verification', data: { name, code }, priority: 'critical' }),
    ]);
  }

  async sendAccessCodeNotifications(email: string, phone: string, name: string, access_code: string, valid_until: string): Promise<void> {
    await Promise.all([
      this.sendNotification({ type: 'email', to: email, template: 'accessCode', data: { name, access_code, valid_until }, priority: 'high' }),
      this.sendNotification({ type: 'sms',   to: phone, template: 'accessCode', data: { name, access_code, valid_until }, priority: 'high' }),
    ]);
  }

  async sendPaymentNotifications(email: string, phone: string, name: string, amount: string, success: boolean, reference?: string): Promise<void> {
    const template = success ? 'paymentSuccess' : 'paymentFailed';
    await Promise.all([
      this.sendNotification({ type: 'email', to: email, template, data: success ? { name, amount, reference } : { name, amount }, priority: 'high' }),
      this.sendNotification({ type: 'sms',   to: phone, template, data: { name, amount }, priority: 'high' }),
    ]);
  }

  async sendEmergencyAlert(contacts: Array<{ email: string; phone: string }>, alert_type: string, location: string): Promise<void> {
    await Promise.all(
      contacts.flatMap(c => [
        this.sendNotification({ type: 'email', to: c.email, template: 'emergencyAlert', data: { alert_type, location }, priority: 'critical' }),
        this.sendNotification({ type: 'sms',   to: c.phone, template: 'emergencyAlert', data: { alert_type, location }, priority: 'critical' }),
      ])
    );
  }

  async getQueueStats() {
    try {
      const res = await fetch('https://qstash.upstash.io/v2/queues', {
        headers: { Authorization: `Bearer ${process.env.QSTASH_TOKEN}` },
      });
      const queues: any[] = res.ok ? await res.json() : [];
      const find = (name: string) => queues.find((q: any) => q.name === name) || {};
      return {
        email: { waiting: find('email-notifications').lag ?? 0 },
        sms:   { waiting: find('sms-notifications').lag ?? 0 },
      };
    } catch {
      return { email: { waiting: 0 }, sms: { waiting: 0 } };
    }
  }
}

export default new NotificationService();
