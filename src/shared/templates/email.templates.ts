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
    subject: data.estate_name ? `Welcome to ${data.estate_name} – Lockwise` : 'Welcome to Lockwise',
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
    subject: data.estate_name
      ? `Access Code for ${data.guest_name || 'Your Guest'} – ${data.estate_name}`
      : 'Access Code Generated – Lockwise',
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
  }),

  estateInvitation: (data: any) => ({
    subject: `You're invited to join ${data.estate_name || 'an estate'} on Lockwise`,
    html: baseTemplate(`
      <div class="content">
        <h2>Estate Invitation</h2>
        <p>Hello ${data.name || 'there'},</p>
        <p>${data.inviter_name || 'A manager'} invited you to join <strong>${data.estate_name || 'their estate'}</strong> on Lockwise.</p>
        <p>Use the secure invitation link below to join:</p>
        <p style="text-align: center;">
          <a href="${data.invitation_link}" class="button">Join Estate</a>
        </p>
        <p>If the button does not work, copy this link:</p>
        <p style="word-break: break-all;">${data.invitation_link}</p>
        <p>This invitation link expires automatically.</p>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `),
    text: `Estate Invitation

Hello ${data.name || 'there'},

${data.inviter_name || 'A manager'} invited you to join ${data.estate_name || 'their estate'} on Lockwise.

Use this link to join:
${data.invitation_link}

Best regards,
The Lockwise Team`
  }),

  subscriptionReceipt: (data: any) => ({
    subject: data.estate_name
      ? `${data.estate_name} – ${data.plan_name || 'Plan'} Subscription Activated`
      : `Subscription Receipt – ${data.plan_name || 'Lockwise Plan'} Activated`,
    html: baseTemplate(`
      <div class="content">
        <h2>Subscription Receipt 🎉</h2>
        <p>Hello ${data.manager_name || 'there'},</p>
        <p>Great news! Your subscription for <strong>${data.estate_name || 'your estate'}</strong> has been activated successfully.</p>
        <div class="code-box">
          <p style="margin: 0 0 8px 0;"><strong>Plan:</strong> ${data.plan_name || 'N/A'}</p>
          <p style="margin: 0 0 8px 0;"><strong>Billing Cycle:</strong> ${data.billing_cycle || 'N/A'}</p>
          <p style="margin: 0 0 8px 0;"><strong>Start Date:</strong> ${data.start_date}</p>
          <p style="margin: 0 0 8px 0;"><strong>Expiry Date:</strong> ${data.end_date}</p>
          <p style="margin: 0 0 8px 0;"><strong>Amount Paid:</strong> ${data.currency || 'NGN'} ${data.amount}</p>
          <p style="margin: 0;"><strong>Reference:</strong> ${data.reference}</p>
        </div>
        <p>Your estate is now fully active and all features are unlocked for the subscription period.</p>
        <p>Please keep this email as your payment receipt.</p>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `),
    text: `Subscription Receipt – ${data.plan_name || 'Lockwise Plan'} Activated

Hello ${data.manager_name || 'there'},

Your subscription for ${data.estate_name || 'your estate'} has been activated.

Plan: ${data.plan_name || 'N/A'}
Billing Cycle: ${data.billing_cycle || 'N/A'}
Start Date: ${data.start_date}
Expiry Date: ${data.end_date}
Amount Paid: ${data.currency || 'NGN'} ${data.amount}
Reference: ${data.reference}

Your estate is now fully active for the subscription period.

Best regards,
The Lockwise Team`
  }),

  referrerWelcome: (data: any) => ({
    subject: 'Welcome to the Lockwise Referral Programme',
    html: baseTemplate(`
      <div class="content">
        <h2>Welcome to the Lockwise Referral Programme 🎉</h2>
        <p>Hello ${data.name || 'there'},</p>
        <p>Your referrer account is set up and ready to go. Here are your referral details:</p>
        <div class="code-box">
          <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your referral code</p>
          <div class="code">${data.referral_code}</div>
        </div>
        <p>Share your unique referral link with estate managers and earn a <strong>10% bonus</strong> on every qualifying payment from estates you refer:</p>
        <div class="code-box">
          <p style="margin: 0; word-break: break-all; font-size: 14px;">${data.referral_link}</p>
        </div>
        <p style="text-align: center;">
          <a href="${data.portal_link}" class="button">Open your referral dashboard</a>
        </p>
        <p>Sign in any time with your email and referral code to track your referrals and earnings.</p>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `),
    text: `Welcome to the Lockwise Referral Programme

Hello ${data.name || 'there'},

Your referrer account is set up. Here are your referral details:

Referral code: ${data.referral_code}
Referral link: ${data.referral_link}

Share your link with estate managers and earn a 10% bonus on every qualifying payment.

Sign in to your dashboard: ${data.portal_link}

Best regards,
The Lockwise Team`
  }),

  electricityReceipt: (data: any) => ({
    subject: `Electricity Recharge Receipt - ${data.reference}`,
    html: baseTemplate(`
      <div class="content">
        <h2>⚡ Electricity Recharge Receipt</h2>
        <p>Hello ${data.name || 'there'},</p>
        <p>Your electricity recharge was successful. Here are the details:</p>
        <div class="code-box">
          <p><strong>Token:</strong></p>
          <div class="code">${data.token}</div>
        </div>
        <table style="width:100%; border-collapse:collapse; margin:20px 0;">
          <tr><td style="padding:8px 0; border-bottom:1px solid #eee;"><strong>Meter Number</strong></td><td style="padding:8px 0; border-bottom:1px solid #eee;">${data.meter_number}</td></tr>
          <tr><td style="padding:8px 0; border-bottom:1px solid #eee;"><strong>Disco</strong></td><td style="padding:8px 0; border-bottom:1px solid #eee;">${data.disco}</td></tr>
          <tr><td style="padding:8px 0; border-bottom:1px solid #eee;"><strong>Amount</strong></td><td style="padding:8px 0; border-bottom:1px solid #eee;">${data.amount}</td></tr>
          <tr><td style="padding:8px 0; border-bottom:1px solid #eee;"><strong>Units</strong></td><td style="padding:8px 0; border-bottom:1px solid #eee;">${data.units}</td></tr>
          <tr><td style="padding:8px 0; border-bottom:1px solid #eee;"><strong>Reference</strong></td><td style="padding:8px 0; border-bottom:1px solid #eee;">${data.reference}</td></tr>
          <tr><td style="padding:8px 0; border-bottom:1px solid #eee;"><strong>Provider</strong></td><td style="padding:8px 0; border-bottom:1px solid #eee;">${data.provider}</td></tr>
          <tr><td style="padding:8px 0;"><strong>Date</strong></td><td style="padding:8px 0;">${data.date}</td></tr>
        </table>
        <p>Please keep this receipt for your records.</p>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `),
    text: `Electricity Recharge Receipt\nToken: ${data.token}\nMeter: ${data.meter_number}\nDisco: ${data.disco}\nAmount: ${data.amount}\nUnits: ${data.units}\nRef: ${data.reference}\nDate: ${data.date}`
  }),

  estateSubmitted: (data: any) => ({
    subject: `New estate "${data.estate_name || 'Unknown'}" submitted for approval`,
    html: baseTemplate(`
      <div class="content">
        <h2>Estate Approval Required</h2>
        <p>Hello ${data.admin_name || 'Admin'},</p>
        <p>A new estate has been submitted for your approval on Lockwise.</p>
        <div class="code-box">
          <p><strong>Estate Name:</strong> ${data.estate_name || 'N/A'}</p>
        </div>
        <p>Please log in to review and approve or decline this estate.</p>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `),
    text: `New estate "${data.estate_name}" submitted for approval. Please review in the admin panel.`
  })
};
