import { emailTemplates } from '../templates/email.templates';

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  WHATSAPP = 'whatsapp'
}

export enum TemplateType {
  VERIFICATION = 'verification',
  PASSWORD_RESET = 'passwordReset',
  WELCOME = 'welcome',
  ACCESS_CODE = 'accessCode',
  PAYMENT_SUCCESS = 'paymentSuccess',
  ENTRY_APPROVED = 'entryApproved',
  ENTRY_REJECTED = 'entryRejected',
  GUEST_ENTERED = 'guestEntered',
  GUEST_EXITED = 'guestExited'
}

interface TemplateData {
  [key: string]: any;
}

interface Template {
  subject?: string;
  html?: string;
  text: string;
}

class TemplateService {
  private templates: Record<NotificationChannel, Record<TemplateType, (data: TemplateData) => Template>> = {
    [NotificationChannel.EMAIL]: {
      [TemplateType.VERIFICATION]: emailTemplates.verification,
      [TemplateType.PASSWORD_RESET]: emailTemplates.passwordReset,
      [TemplateType.WELCOME]: emailTemplates.welcome,
      [TemplateType.ACCESS_CODE]: emailTemplates.accessCode,
      [TemplateType.PAYMENT_SUCCESS]: emailTemplates.paymentSuccess,
      [TemplateType.ENTRY_APPROVED]: (data) => ({ text: `Entry approved for ${data.guestName}. Access code: ${data.accessCode}` }),
      [TemplateType.ENTRY_REJECTED]: (data) => ({ text: `Entry rejected for ${data.guestName}. Access code: ${data.accessCode}` }),
      [TemplateType.GUEST_ENTERED]: (data) => ({ text: `${data.guestName} has entered the premises at ${new Date().toLocaleString()}` }),
      [TemplateType.GUEST_EXITED]: (data) => ({ text: `${data.guestName} has left the premises at ${new Date().toLocaleString()}` })
    },
    [NotificationChannel.WHATSAPP]: {
      [TemplateType.VERIFICATION]: (data) => ({ text: `🔐 *Lockwise Verification*\n\nYour verification code: ${data.code || data}\n\nExpires in 10 minutes.` }),
      [TemplateType.PASSWORD_RESET]: (data) => ({ text: `🔐 *Password Reset*\n\nReset your password: ${data.reset_link || data}\n\nExpires in 1 hour.` }),
      [TemplateType.WELCOME]: (data) => ({ text: `🎉 *Welcome to Lockwise!*\n\nHello ${data.name}!\n\nYou're now part of ${data.estate_name || 'Lockwise'}. Enjoy secure estate management!` }),
      [TemplateType.ACCESS_CODE]: (data) => ({ text: `🔑 *Access Code Generated*\n\nGuest: ${data.guest_name}\nCode: ${data.access_code || data.code}\nValid until: ${data.valid_until}` }),
      [TemplateType.PAYMENT_SUCCESS]: (data) => ({ text: `✅ *Payment Successful*\n\nAmount: ${data.amount}\nReference: ${data.reference}\n\nThank you!` }),
      [TemplateType.ENTRY_APPROVED]: (data) => ({ text: `🟢 *Entry Approved*\n\nGuest: ${data.guestName}\nAccess Code: ${data.accessCode}\nTime: ${new Date().toLocaleString()}\n\nYour guest has been granted entry.` }),
      [TemplateType.ENTRY_REJECTED]: (data) => ({ text: `🔴 *Entry Rejected*\n\nGuest: ${data.guestName}\nAccess Code: ${data.accessCode}\nTime: ${new Date().toLocaleString()}\n\nYour guest's entry was rejected.` }),
      [TemplateType.GUEST_ENTERED]: (data) => ({ text: `🚪 *Guest Entered*\n\nGuest: ${data.guestName}\nTime: ${new Date().toLocaleString()}\n\nYour guest has just entered the premises.` }),
      [TemplateType.GUEST_EXITED]: (data) => ({ text: `🚪 *Guest Exited*\n\nGuest: ${data.guestName}\nTime: ${new Date().toLocaleString()}\n\nYour guest has left the premises.` })
    },
    [NotificationChannel.SMS]: {
      [TemplateType.VERIFICATION]: (data) => ({ text: `Lockwise verification code: ${data.code || data}. Expires in 10 minutes.` }),
      [TemplateType.PASSWORD_RESET]: (data) => ({ text: `Reset your Lockwise password: ${data.reset_link || data}` }),
      [TemplateType.WELCOME]: (data) => ({ text: `Welcome to Lockwise, ${data.name}! Your estate management solution is ready.` }),
      [TemplateType.ACCESS_CODE]: (data) => ({ text: `Access code for ${data.guest_name}: ${data.access_code || data.code}. Valid until ${data.valid_until}` }),
      [TemplateType.PAYMENT_SUCCESS]: (data) => ({ text: `Payment successful. Amount: ${data.amount}, Ref: ${data.reference}` }),
      [TemplateType.ENTRY_APPROVED]: (data) => ({ text: `Entry approved for ${data.guestName}. Code: ${data.accessCode}` }),
      [TemplateType.ENTRY_REJECTED]: (data) => ({ text: `Entry rejected for ${data.guestName}. Code: ${data.accessCode}` }),
      [TemplateType.GUEST_ENTERED]: (data) => ({ text: `${data.guestName} entered at ${new Date().toLocaleString()}` }),
      [TemplateType.GUEST_EXITED]: (data) => ({ text: `${data.guestName} left at ${new Date().toLocaleString()}` })
    },
    [NotificationChannel.PUSH]: {
      [TemplateType.VERIFICATION]: (data) => ({ text: `Verification code: ${data.code || data}` }),
      [TemplateType.PASSWORD_RESET]: (data) => ({ text: 'Password reset link sent to your email' }),
      [TemplateType.WELCOME]: (data) => ({ text: `Welcome to Lockwise, ${data.name}!` }),
      [TemplateType.ACCESS_CODE]: (data) => ({ text: `Access code generated for ${data.guest_name}` }),
      [TemplateType.PAYMENT_SUCCESS]: (data) => ({ text: `Payment successful: ${data.amount}` }),
      [TemplateType.ENTRY_APPROVED]: (data) => ({ text: `Entry approved for ${data.guestName}` }),
      [TemplateType.ENTRY_REJECTED]: (data) => ({ text: `Entry rejected for ${data.guestName}` }),
      [TemplateType.GUEST_ENTERED]: (data) => ({ text: `${data.guestName} has entered` }),
      [TemplateType.GUEST_EXITED]: (data) => ({ text: `${data.guestName} has left` })
    }
  };

  getTemplate(channel: NotificationChannel, type: TemplateType, data: TemplateData): Template {
    const channelTemplates = this.templates[channel];
    if (!channelTemplates) {
      throw new Error(`Unsupported channel: ${channel}`);
    }

    const templateFunction = channelTemplates[type];
    if (!templateFunction) {
      throw new Error(`Template not found for ${channel}:${type}`);
    }

    return templateFunction(data);
  }

  getAllChannels(): NotificationChannel[] {
    return Object.values(NotificationChannel);
  }

  getAllTemplateTypes(): TemplateType[] {
    return Object.values(TemplateType);
  }

  isTemplateSupported(channel: NotificationChannel, type: TemplateType): boolean {
    return !!(this.templates[channel]?.[type]);
  }
}

export default new TemplateService();