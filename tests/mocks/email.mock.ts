/**
 * Mock email service for testing email sending functionality
 */

export interface EmailMessage {
  to: string | string[];
  from?: string;
  subject: string;
  html?: string;
  text?: string;
  attachments?: any[];
  template?: string;
  context?: any;
  timestamp: Date;
}

class EmailServiceMock {
  private sentEmails: EmailMessage[] = [];

  /**
   * Sends an email (mock implementation)
   * @param params - Email parameters
   * @returns Success response
   */
  async sendEmail(params: {
    to: string | string[];
    from?: string;
    subject: string;
    html?: string;
    text?: string;
    attachments?: any[];
  }): Promise<{ success: boolean; messageId: string }> {
    this.sentEmails.push({
      ...params,
      timestamp: new Date(),
    });

    return {
      success: true,
      messageId: `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
  }

  /**
   * Sends a welcome email
   * @param to - Recipient email
   * @param name - Recipient name
   * @returns Success response
   */
  async sendWelcomeEmail(
    to: string,
    name: string
  ): Promise<{ success: boolean; messageId: string }> {
    return this.sendEmail({
      to,
      subject: 'Welcome to Lockwise',
      html: `<h1>Welcome ${name}!</h1>`,
      text: `Welcome ${name}!`,
    });
  }

  /**
   * Sends a verification email
   * @param to - Recipient email
   * @param code - Verification code
   * @returns Success response
   */
  async sendVerificationEmail(
    to: string,
    code: string
  ): Promise<{ success: boolean; messageId: string }> {
    return this.sendEmail({
      to,
      subject: 'Verify Your Email',
      html: `<p>Your verification code is: <strong>${code}</strong></p>`,
      text: `Your verification code is: ${code}`,
    });
  }

  /**
   * Sends a password reset email
   * @param to - Recipient email
   * @param resetLink - Password reset link
   * @returns Success response
   */
  async sendPasswordResetEmail(
    to: string,
    resetLink: string
  ): Promise<{ success: boolean; messageId: string }> {
    return this.sendEmail({
      to,
      subject: 'Reset Your Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`,
      text: `Reset your password: ${resetLink}`,
    });
  }

  /**
   * Sends an access code email
   * @param to - Recipient email
   * @param accessCode - Access code
   * @param details - Additional details
   * @returns Success response
   */
  async sendAccessCodeEmail(
    to: string,
    accessCode: string,
    details?: any
  ): Promise<{ success: boolean; messageId: string }> {
    return this.sendEmail({
      to,
      subject: 'Your Access Code',
      html: `<p>Your access code is: <strong>${accessCode}</strong></p>`,
      text: `Your access code is: ${accessCode}`,
    });
  }

  /**
   * Sends a payment success email
   * @param to - Recipient email
   * @param amount - Payment amount
   * @param reference - Payment reference
   * @returns Success response
   */
  async sendPaymentSuccessEmail(
    to: string,
    amount: number,
    reference: string
  ): Promise<{ success: boolean; messageId: string }> {
    return this.sendEmail({
      to,
      subject: 'Payment Successful',
      html: `<p>Your payment of ₦${amount} was successful. Reference: ${reference}</p>`,
      text: `Your payment of ₦${amount} was successful. Reference: ${reference}`,
    });
  }

  /**
   * Gets all sent emails
   * @returns Array of sent emails
   */
  getSentEmails(): EmailMessage[] {
    return [...this.sentEmails];
  }

  /**
   * Gets emails sent to a specific recipient
   * @param email - Recipient email
   * @returns Array of sent emails
   */
  getEmailsSentTo(email: string): EmailMessage[] {
    return this.sentEmails.filter((msg) => {
      if (Array.isArray(msg.to)) {
        return msg.to.includes(email);
      }
      return msg.to === email;
    });
  }

  /**
   * Gets the last sent email
   * @returns Last sent email or null
   */
  getLastSentEmail(): EmailMessage | null {
    return this.sentEmails.length > 0
      ? this.sentEmails[this.sentEmails.length - 1]
      : null;
  }

  /**
   * Gets count of sent emails
   * @returns Number of sent emails
   */
  getSentEmailCount(): number {
    return this.sentEmails.length;
  }

  /**
   * Clears all sent emails
   */
  clear(): void {
    this.sentEmails = [];
  }

  /**
   * Checks if an email was sent to a specific recipient
   * @param email - Recipient email
   * @returns True if email was sent
   */
  wasEmailSentTo(email: string): boolean {
    return this.getEmailsSentTo(email).length > 0;
  }

  /**
   * Checks if an email with specific subject was sent
   * @param subject - Email subject
   * @returns True if email was sent
   */
  wasEmailSentWithSubject(subject: string): boolean {
    return this.sentEmails.some((msg) => msg.subject.includes(subject));
  }
}

// Export mock instance
export const emailServiceMock = new EmailServiceMock();

// Export Jest mock functions
export const mockEmailService = {
  sendEmail: jest.fn().mockImplementation((params: any) =>
    emailServiceMock.sendEmail(params)
  ),

  sendWelcomeEmail: jest.fn().mockImplementation((to: string, name: string) =>
    emailServiceMock.sendWelcomeEmail(to, name)
  ),

  sendVerificationEmail: jest.fn().mockImplementation((to: string, code: string) =>
    emailServiceMock.sendVerificationEmail(to, code)
  ),

  sendPasswordResetEmail: jest
    .fn()
    .mockImplementation((to: string, resetLink: string) =>
      emailServiceMock.sendPasswordResetEmail(to, resetLink)
    ),

  sendAccessCodeEmail: jest
    .fn()
    .mockImplementation((to: string, code: string, details?: any) =>
      emailServiceMock.sendAccessCodeEmail(to, code, details)
    ),

  sendPaymentSuccessEmail: jest
    .fn()
    .mockImplementation((to: string, amount: number, reference: string) =>
      emailServiceMock.sendPaymentSuccessEmail(to, amount, reference)
    ),
};

// Reset function for tests
export const resetEmailMock = () => {
  emailServiceMock.clear();
  Object.values(mockEmailService).forEach((mock) => {
    if (typeof mock === 'function' && 'mockClear' in mock) {
      (mock as jest.Mock).mockClear();
    }
  });
};

export default emailServiceMock;
