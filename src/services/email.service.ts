import nodemailer from "nodemailer";
import { emailTemplates } from "../templates/email.templates";

interface EmailData {
  to: string;
  template: keyof typeof emailTemplates;
  data: any;
  from?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER || "smtp-relay.brevo.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_KEY,
      },
    });
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const template = emailTemplates[emailData.template](emailData.data);

      const mailOptions = {
        from:
          emailData.from || process.env.SMTP_SENDER || "noreply@lockwise.com",
        to: emailData.to,
        subject: template.subject,
        html: template.html,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully: ${result.messageId}`);
      return true;
    } catch (error) {
      console.error("Email sending failed:", error);
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
      template: "welcome",
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
      template: "verification",
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
      template: "passwordReset",
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
      template: "accessCode",
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
      template: "paymentSuccess",
      data: { name, amount, reference },
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("Email service connection verified");
      return true;
    } catch (error) {
      console.error("Email service connection failed:", error);
      return false;
    }
  }
}

export default new EmailService();
