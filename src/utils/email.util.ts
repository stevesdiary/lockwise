
const emailTemplate ={
  estate_invitation: (first_name: string, estate_name: string, invitation_code: string) => `
    <h1>Welcome to ${estate_name}, ${first_name}!</h1>  
    <p>We are excited to invite you to join our estate community.</p>
    <p>Your invitation code is: <strong>${invitation_code}</strong></p>
    <p>Use this code to complete your registration.</p>
    <p>Thank you for being a part of our community!</p>
  `,
  onboading: (name: string, verificationCode: string) => `
    <h1>Welcome, ${name}!</h1>
    <p>Thank you for joining us. We are excited to have you on board.</p>
  `,
  passwordReset: (name: string) => `
    <h1>Password Reset Request</h1>
    <p>Hello ${name},</p>
    <p>Click the link below to reset your password:</p>
    <a href="https://example.com/reset-password">Reset Password</a>
  `,
  emailVerification: (first_name: string, verificationCode: string) => `
    <h1>Account Verification</h1>
    <p>Hello ${first_name},</p>
    <p>Please verify your email using the code below:</p>
    <p><strong>${verificationCode}</strong></p>
  `,
  newsletter: (first_name: string) => `
    <h1>Newsletter Subscription</h1>
    <p>Hi ${first_name},</p>
    <p>Thank you for subscribing to our newsletter!</p>
  `,
  welcome: (first_name: string) => `
    <h1>Welcome to Our Service, ${first_name}!</h1>
    <p>We are thrilled to have you with us.</p>
    <p>Feel free to explore and let us know if you have any questions.</p>
  `,
  accountActivation: (first_name: string, activationLink: string) => `
    <h1>Activate Your Account</h1>
    <p>Hello ${first_name},</p>
    <p>Thank you for registering. Please activate your account by clicking the link below:</p>
    <a href="${activationLink}">Activate Account</a>
  `,
}

export default emailTemplate ;