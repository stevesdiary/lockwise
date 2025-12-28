export const emailTemplates = {
  welcome: (data: { name: string; estate_name?: string }) => ({
    subject: 'Welcome to Lockwise!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Welcome to Lockwise, ${data.name}!</h2>
        <p>Thank you for joining Lockwise - your smart access management solution.</p>
        ${data.estate_name ? `<p>You've been added to <strong>${data.estate_name}</strong>.</p>` : ''}
        <p>You can now:</p>
        <ul>
          <li>Generate access codes for visitors</li>
          <li>Manage your property access</li>
          <li>View access logs and analytics</li>
        </ul>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `
  }),

  verification: (data: { name: string; code: string }) => ({
    subject: 'Verify Your Email - Lockwise',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Email Verification</h2>
        <p>Hi ${data.name},</p>
        <p>Please verify your email using this code:</p>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0;">${data.code}</h1>
        </div>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `
  }),

  passwordReset: (data: { name: string; reset_link: string }) => ({
    subject: 'Reset Your Password - Lockwise',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset Request</h2>
        <p>Hi ${data.name},</p>
        <p>Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.reset_link}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </div>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `
  }),

  accessCode: (data: { name: string; access_code: string; valid_until: string }) => ({
    subject: 'Access Code Generated - Lockwise',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Access Code Generated</h2>
        <p>Hi ${data.name},</p>
        <div style="background: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #28a745; font-size: 32px; margin: 0;">${data.access_code}</h1>
        </div>
        <p>Valid until: <strong>${data.valid_until}</strong></p>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `
  }),

  paymentSuccess: (data: { name: string; amount: string; reference: string }) => ({
    subject: 'Payment Successful - Lockwise',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Payment Successful!</h2>
        <p>Hi ${data.name},</p>
        <p>Amount: ₦${data.amount}</p>
        <p>Reference: ${data.reference}</p>
        <p>Best regards,<br>The Lockwise Team</p>
      </div>
    `
  })
};