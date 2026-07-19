interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userId: string;
  metadata?: any;
}

class RealtimeNotificationService {
  private webSocketService: any = null;

  setWebSocketService(service: any) {
    this.webSocketService = service;
  }

  async sendNotification(notification: NotificationData) {
    try {
      if (!this.webSocketService) {
        console.warn('WebSocket service not initialized');
        return { success: false };
      }

      this.webSocketService.sendNotification(notification.userId, {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        timestamp: new Date(),
        metadata: notification.metadata
      });

      return { success: true };
    } catch (error) {
      console.error('Failed to send real-time notification:', error);
      return { success: false, error };
    }
  }

  async broadcastToStaff(event: string, data: any) {
    try {
      if (!this.webSocketService) {
        console.warn('WebSocket service not initialized');
        return { success: false };
      }

      this.webSocketService.broadcastToStaff(event, {
        ...data,
        timestamp: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to broadcast to staff:', error);
      return { success: false, error };
    }
  }
}

export default new RealtimeNotificationService();
