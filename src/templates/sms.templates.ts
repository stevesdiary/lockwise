export const smsTemplates = {
  verification: (data: { name: string; code: string }) => 
    `Hi ${data.name}, your Lockwise verification code is: ${data.code}. Valid for 10 minutes.`,

  accessCode: (data: { name: string; access_code: string; valid_until: string }) => 
    `Hi ${data.name}, your access code is: ${data.access_code}. Valid until ${data.valid_until}. - Lockwise`,

  passwordReset: (data: { name: string; code: string }) => 
    `Hi ${data.name}, your password reset code is: ${data.code}. Valid for 15 minutes. - Lockwise`,

  emergencyAlert: (data: { alert_type: string; location: string }) => 
    `🚨 EMERGENCY ALERT: ${data.alert_type.toUpperCase()} at ${data.location}. Take immediate action. - Lockwise`,

  paymentSuccess: (data: { name: string; amount: string }) => 
    `Hi ${data.name}, your payment of ₦${data.amount} was successful. Thank you! - Lockwise`,

  paymentFailed: (data: { name: string; amount: string }) => 
    `Hi ${data.name}, your payment of ₦${data.amount} failed. Please retry. - Lockwise`,

  visitorArrival: (data: { resident_name: string; visitor_name: string }) => 
    `Hi ${data.resident_name}, ${data.visitor_name} has arrived at the gate. - Lockwise`
};