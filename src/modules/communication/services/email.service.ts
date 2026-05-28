import { emailTemplates } from "../../../shared/templates/email.templates";

export type EmailAddress = { email: string; name?: string };

export type EmailPayload = {
  sender?: EmailAddress;
  to: EmailAddress[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  replyTo?: EmailAddress;
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  tags?: string[];
};

export interface EmailProvider {
  send(payload: EmailPayload): Promise<void>;
}

type RecipientInput = string | EmailAddress | Array<string | EmailAddress>;

type BrevoProviderOptions = {
  apiKey: string;
  apiUrl?: string;
  defaultSender: EmailAddress;
  timeoutMs?: number;
};

const DEFAULT_API_URL = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_TIMEOUT_MS = 15000;

const normalizeRecipient = (recipient: string | EmailAddress): EmailAddress => {
  if (typeof recipient === 'string') {
    return { email: recipient };
  }
  return recipient;
};

const normalizeRecipients = (recipients: RecipientInput): EmailAddress[] => {
  const list = Array.isArray(recipients) ? recipients : [recipients];
  return list
    .filter(recipient => Boolean(recipient))
    .map(recipient => normalizeRecipient(recipient as string | EmailAddress))
    .filter(item => item.email);
};

const toErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return String(error);
};

const parseJson = (value: string): Record<string, any> | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as Record<string, any>;
  } catch {
    return null;
  }
};

class BrevoEmailProvider implements EmailProvider {
  private apiKey: string;
  private apiUrl: string;
  private defaultSender: EmailAddress;
  private timeoutMs: number;

  constructor(options: BrevoProviderOptions) {
    this.apiKey = options.apiKey;
    this.apiUrl = options.apiUrl ?? DEFAULT_API_URL;
    this.defaultSender = options.defaultSender;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  }

  async send(payload: EmailPayload): Promise<void> {
    if (!this.apiKey) {
      console.warn('Brevo API key not configured. Email not sent.');
      return;
    }

    if (!payload.to?.length) {
      throw new Error('Email payload "to" is required.');
    }

    if (!payload.subject || !payload.htmlContent) {
      throw new Error('Email payload must include "subject" and "htmlContent".');
    }

    const body: Record<string, any> = {
      sender: payload.sender ?? this.defaultSender,
      to: payload.to,
      subject: payload.subject,
      htmlContent: payload.htmlContent
    };

    if (payload.textContent) body.textContent = payload.textContent;
    if (payload.replyTo) body.replyTo = payload.replyTo;
    if (payload.cc?.length) body.cc = payload.cc;
    if (payload.bcc?.length) body.bcc = payload.bcc;
    if (payload.tags?.length) body.tags = payload.tags;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      const responseText = await response.text();

      if (!response.ok) {
        const errorJson = parseJson(responseText);
        const detail =
          (errorJson?.message as string | undefined) ||
          (errorJson?.error as string | undefined) ||
          responseText ||
          response.statusText;
        const errorMessage = `Brevo API error (${response.status}): ${detail}`;
        console.error('Brevo email send failed', {
          status: response.status,
          error: errorMessage,
          to: payload.to.map(item => item.email),
          subject: payload.subject
        });
        throw new Error(errorMessage);
      }

      const responseJson = parseJson(responseText);
      console.log('Email sent successfully', {
        // to: payload.to.map(item => item.email),
        subject: payload.subject,
        messageId: responseJson?.messageId
      });
    } catch (error) {
      const message = toErrorMessage(error);
      console.error('Failed to send email', {
        error: message,
        to: payload.to.map(item => item.email),
        subject: payload.subject
      });
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}

interface EmailData {
  to: string;
  template: keyof typeof emailTemplates;
  data: any;
  from?: string;
}

class EmailService {
  private provider: EmailProvider;
  private defaultSender: EmailAddress;

  constructor() {
    this.defaultSender = {
      name: 'Lockwise',
      email: process.env.SMTP_FROM || 'noreply@lockwise.com'
    };

    this.provider = new BrevoEmailProvider({
      apiKey: process.env.BREVO_API_KEY || '',
      defaultSender: this.defaultSender
    });
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const template = emailTemplates[emailData.template](emailData.data);

      await this.provider.send({
        sender: emailData.from ? { email: emailData.from } : this.defaultSender,
        to: normalizeRecipients(emailData.to),
        subject: template.subject,
        htmlContent: template.html
      });

      return true;
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  async sendWelcomeEmail(
    to: string,
    name: string,
    estate_name?: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'welcome',
      data: { name, estate_name },
    });
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    code: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'verification',
      data: { name, code },
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    reset_link: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'passwordReset',
      data: { name, reset_link },
    });
  }

  async sendAccessCodeEmail(
    to: string,
    name: string,
    access_code: string,
    valid_until: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'accessCode',
      data: { name, access_code, valid_until },
    });
  }

  async sendPaymentSuccessEmail(
    to: string,
    name: string,
    amount: string,
    reference: string
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'paymentSuccess',
      data: { name, amount, reference },
    });
  }

  async sendEstateInvitationEmail(
    to: string,
    data: {
      name?: string;
      inviter_name?: string;
      estate_name: string;
      invitation_link: string;
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'estateInvitation',
      data,
    });
  }

  async sendEstateSubmittedEmail(
    to: string,
    data: { admin_name: string; estate_name: string }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'estateSubmitted',
      data,
    });
  }

  async sendSubscriptionReceiptEmail(
    to: string,
    data: {
      manager_name: string;
      estate_name: string;
      plan_name: string;
      billing_cycle: string;
      start_date: string;
      end_date: string;
      amount: string;
      currency: string;
      reference: string;
    }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'subscriptionReceipt',
      data,
    });
  }

  async sendReferrerWelcomeEmail(
    to: string,
    data: { name: string; referral_code: string; referral_link: string; portal_link: string }
  ): Promise<boolean> {
    return this.sendEmail({
      to,
      template: 'referrerWelcome',
      data,
    });
  }
}

export default new EmailService();
