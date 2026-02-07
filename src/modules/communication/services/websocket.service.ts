import { Socket, Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"]
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use((socket: any, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected`);
      
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
        socket.join(`user_${socket.userId}`);
        
        if (socket.userRole === 'admin' || socket.userRole === 'manager') {
          socket.join('staff');
        }
      }

      // Chat support events
      socket.on('join_support_chat', (data) => {
        socket.join(`support_${data.chatId}`);
      });

      socket.on('send_message', (data) => {
        this.io.to(`support_${data.chatId}`).emit('new_message', {
          id: Date.now().toString(),
          message: data.message,
          senderId: socket.userId,
          timestamp: new Date(),
          chatId: data.chatId
        });
      });

      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          console.log(`User ${socket.userId} disconnected`);
        }
      });
    });
  }

  // Send notification to specific user
  sendNotification(userId: string, notification: any) {
    this.io.to(`user_${userId}`).emit('notification', notification);
  }

  // Send access code update
  sendAccessCodeUpdate(userId: string, accessCode: any) {
    this.io.to(`user_${userId}`).emit('access_code_update', accessCode);
  }

  // Broadcast to all staff
  broadcastToStaff(event: string, data: any) {
    this.io.to('staff').emit(event, data);
  }

  // Send chat message
  sendChatMessage(chatId: string, message: any) {
    this.io.to(`support_${chatId}`).emit('new_message', message);
  }

  getIO() {
    return this.io;
  }
}

export default WebSocketService;