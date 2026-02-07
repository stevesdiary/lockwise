import { Server as SocketIOServer } from 'socket.io';
import { getFromRedis } from '../../../shared/core/redis';
import { analyticsService } from './analytics.service';

export class RealTimeAnalytics {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('subscribe_analytics', async (data) => {
        if (data.role === 'admin' || data.role === 'manager') {
          socket.join('analytics_room');
          
          const dashboardData = await this.getDashboardData();
          socket.emit('analytics_update', dashboardData);
        }
      });

      socket.on('disconnect', () => {
        socket.leave('analytics_room');
      });
    });

    setInterval(async () => {
      const dashboardData = await this.getDashboardData();
      this.io.to('analytics_room').emit('analytics_update', dashboardData);
    }, 30000);
  }

  async broadcastEvent(event: string, data: any) {
    this.io.to('analytics_room').emit('real_time_event', { event, data, timestamp: new Date() });
  }

  private async getDashboardData() {
    const today = new Date().toISOString().split('T')[0];
    
    const [activeUsers, totalEvents, systemHealth] = await Promise.all([
      getFromRedis(`analytics:active_users:${today}`).then(v => v || '0'),
      getFromRedis(`analytics:total_events:${today}`).then(v => v || '0'),
      analyticsService.getSystemHealth()
    ]);

    return {
      activeUsers: parseInt(activeUsers),
      totalEvents: parseInt(totalEvents),
      systemHealth,
      timestamp: new Date()
    };
  }
}

export const createRealTimeAnalytics = (io: SocketIOServer) => {
  return new RealTimeAnalytics(io);
};