const baseTemplate = (content: string) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; }
        .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
        .code-box { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 4px; text-align: center; }
        .button { display: inline-block; padding: 14px 32px; background: #667eea; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666666; font-size: 12px; border-top: 1px solid #e0e0e0; }
        .footer a { color: #667eea; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Lockwise</h1>
        </div>
        ${content}
        <div class="footer">
          <p>This is an automated message from Lockwise. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Lockwise. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
`;

export const emailTemplates = {
  verification: (data: any) => ({
    subject: 'Verify Your Email - Lockwise',
    html: baseTemplate(`
      <div class="content">
        <h2>Email Verification</h2>
        <p>Hello ${data.name || 'there'},</p>
        <p>Thank you for registering with Lockwise. To complete your registration, please use the verification code below:</p>
        <div class="code-box">
          <div class="code">${data.code || data}</div>
        </div>
        <p>This code will expire in 10 minutes for security reasons.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `),
    text: `Verify Your Email - Lockwise

Hello ${data.name || 'there'},

Thank you for registering with Lockwise. To complete your registration, please use the verification code below:

${data.code || data}

This code will expire in 10 minutes for security reasons.

If you didn't request this verification, please ignore this email.

Best regards,
The Lockwise Team`
  }),
  
  passwordReset: (data: any) => ({
    subject: 'Reset Your Password - Lockwise',
    html: baseTemplate(`
      <div class="content">
        <h2>Password Reset Request</h2>
        <p>Hello ${data.name || 'there'},</p>
        <p>We received a request to reset your password for your Lockwise account.</p>
        <p>Click the button below to reset your password:</p>
        <p style="text-align: center;">
          <a href="${data.reset_link || data}" class="button">Reset Password</a>
        </p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `),
    text: `Reset Your Password - Lockwise

Hello ${data.name || 'there'},

We received a request to reset your password for your Lockwise account.

Reset your password: ${data.reset_link || data}

This link will expire in 1 hour for security reasons.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
The Lockwise Team`
  }),
  
  welcome: (data: any) => ({
    subject: 'Welcome to Lockwise - Your Smart Estate Management Solution',
    html: baseTemplate(`
      <div class="content">
        <h2>Welcome to Lockwise! 🎉</h2>
        <p>Hello ${data.name || 'there'},</p>
        <p>We're thrilled to have you join ${data.estate_name ? `<strong>${data.estate_name}</strong>` : 'Lockwise'}!</p>
        <p>Lockwise is your comprehensive estate management solution, providing:</p>
        <ul>
          <li>🔐 Secure access control and visitor management</li>
          <li>📱 Real-time notifications and updates</li>
          <li>💳 Seamless payment processing</li>
          <li>🏘️ Community engagement tools</li>
        </ul>
        <p>Get started by logging into your account and exploring all the features we have to offer.</p>
        <p>If you have any questions, our support team is here to help!</p>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `),
    text: `Welcome to Lockwise - Your Smart Estate Management Solution

Hello ${data.name || 'there'},

We're thrilled to have you join ${data.estate_name || 'Lockwise'}!

Lockwise is your comprehensive estate management solution, providing:
• 🔐 Secure access control and visitor management
• 📱 Real-time notifications and updates
• 💳 Seamless payment processing
• 🏘️ Community engagement tools

Get started by logging into your account and exploring all the features we have to offer.

If you have any questions, our support team is here to help!

Best regards,
The Lockwise Team`
  }),
  
  accessCode: (data: any) => ({
    subject: 'Access Code Generated - Lockwise',
    html: baseTemplate(`
      <div class="content">
        <h2>Access Code Generated</h2>
        <p>Hello ${data.name || 'there'},</p>
        <p>An access code has been generated for ${data.guest_name || 'your guest'}:</p>
        <div class="code-box">
          <div class="code">${data.access_code || data.code}</div>
        </div>
        <p><strong>Valid until:</strong> ${data.valid_until || 'the specified date'}</p>
        <p>Please share this code with your guest. They will need it to gain entry to the estate.</p>
        <p>For security reasons, this code is unique and should not be shared publicly.</p>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `),
    text: `Access Code Generated - Lockwise

Hello ${data.name || 'there'},

An access code has been generated for ${data.guest_name || 'your guest'}:

${data.access_code || data.code}

Valid until: ${data.valid_until || 'the specified date'}

Please share this code with your guest. They will need it to gain entry to the estate.

For security reasons, this code is unique and should not be shared publicly.

Best regards,
The Lockwise Team`
  }),

  paymentSuccess: (data: any) => ({
    subject: 'Payment Successful - Lockwise',
    html: baseTemplate(`
      <div class="content">
        <h2>Payment Confirmation ✓</h2>
        <p>Hello ${data.name || 'there'},</p>
        <p>Your payment has been successfully processed!</p>
        <div class="code-box">
          <p style="margin: 0;"><strong>Amount:</strong> ${data.amount}</p>
          <p style="margin: 10px 0 0 0;"><strong>Reference:</strong> ${data.reference}</p>
        </div>
        <p>Thank you for your payment. A receipt has been generated for your records.</p>
        <p>If you have any questions about this transaction, please contact our support team.</p>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `),
    text: `Payment Successful - Lockwise

Hello ${data.name || 'there'},

Your payment has been successfully processed!

Amount: ${data.amount}
Reference: ${data.reference}

Thank you for your payment. A receipt has been generated for your records.

If you have any questions about this transaction, please contact our support team.

Best regards,
The Lockwise Team`
  })
};