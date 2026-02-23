export class RealtimeNotificationService {
  async sendNotification(userId: string | number, message: string) {
    // WebSocket or SSE implementation
    console.log(`Sending notification to user ${userId}: ${message}`);
  }
}

export default new RealtimeNotificationService();
