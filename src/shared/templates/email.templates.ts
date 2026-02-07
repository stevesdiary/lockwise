export const emailTemplates = {
  verification: (data: any) => ({
    subject: 'Verify Your Email',
    html: `<p>Your verification code is: <strong>${data.code || data}</strong></p>`
  }),
  
  passwordReset: (data: any) => ({
    subject: 'Reset Your Password',
    html: `<p>Click here to reset your password: <a href="${data.reset_link || data}">Reset Password</a></p>`
  }),
  
  welcome: (data: any) => ({
    subject: 'Welcome to Lockwise',
    html: `<p>Welcome ${data.name || data}! Thank you for joining Lockwise.</p>`
  }),
  
  accessCode: (data: any) => ({
    subject: 'Access Code Generated',
    html: `<p>Access code for ${data.guest_name || 'Guest'}: <strong>${data.access_code || data.code}</strong></p>`
  }),

  paymentSuccess: (data: any) => ({
    subject: 'Payment Successful',
    html: `<p>Hello ${data.name}, your payment of ${data.amount} was successful. Reference: ${data.reference}</p>`
  })
};
