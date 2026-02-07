export const deepLinkService = {
  generateLink(path: string, params?: Record<string, string>): string {
    const baseUrl = process.env.DEEP_LINK_BASE || 'lockwise://';
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return `${baseUrl}${path}${queryString}`;
  },

  accessCode(codeId: string, code: string): string {
    return this.generateLink('access-code', { id: codeId, code });
  },

  guestInvite(inviteId: string): string {
    return this.generateLink('guest-invite', { id: inviteId });
  },

  emergencyAlert(alertId: string): string {
    return this.generateLink('emergency', { id: alertId });
  },

  paymentLink(paymentId: string): string {
    return this.generateLink('payment', { id: paymentId });
  },

  chatRoom(roomId: string): string {
    return this.generateLink('chat', { room: roomId });
  },

  userProfile(userId: string): string {
    return this.generateLink('profile', { user: userId });
  },

  passwordReset(token: string): string {
    return this.generateLink('reset-password', { token });
  }
};