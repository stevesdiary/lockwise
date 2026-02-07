export class RealtimeNotificationService {
  async sendNotification(userId: number, message: string) {
    // WebSocket or SSE implementation
    console.log(`Sending notification to user ${userId}: ${message}`);
  }
}

export default new RealtimeNotificationService();
