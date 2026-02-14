import axios from 'axios';

interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export const brevoEmailService = {
  sendEmail: async (emailData: EmailData) => {
    try {
      const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'Lockwise',
          email: process.env.BREVO_SENDER_EMAIL
        },
        to: [{ email: emailData.to }],
        subject: emailData.subject,
        htmlContent: emailData.htmlContent,
        textContent: emailData.textContent
      }, {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      });

      return { success: true, messageId: (response.data as any).messageId };
    } catch (error) {
      console.error('Brevo email error:', error);
      return { success: false, error };
    }
  },

  sendPaymentConfirmation: async (email: string, amount: number, reference: string) => {
    const htmlContent = `
      <h2>Payment Confirmation</h2>
      <p>Your payment of ₦${amount} has been successfully processed.</p>
      <p>Reference: ${reference}</p>
      <p>Thank you for using Lockwise!</p>
    `;

    return await brevoEmailService.sendEmail({
      to: email,
      subject: 'Payment Confirmation - Lockwise',
      htmlContent,
      textContent: `Payment of ₦${amount} confirmed. Reference: ${reference}`
    });
  },

  sendSubscriptionReminder: async (email: string, daysLeft: number) => {
    const htmlContent = `
      <h2>Subscription Reminder</h2>
      <p>Your Lockwise subscription expires in ${daysLeft} days.</p>
      <p>Renew now to continue enjoying uninterrupted access.</p>
    `;

    return await brevoEmailService.sendEmail({
      to: email,
      subject: 'Subscription Expiring Soon - Lockwise',
      htmlContent,
      textContent: `Your subscription expires in ${daysLeft} days. Please renew.`
    });
  }
};