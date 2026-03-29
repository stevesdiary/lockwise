import { getFromRedis, saveToRedis, deleteFromRedis } from '../../../shared/core/redis';

interface SessionData {
  userId: string;
  estateId: string;
  role: string;
  loginTime: number;
  lastActivity: number;
  deviceInfo?: string;
  refreshToken: string;
}

class SessionService {
  private readonly REFRESH_TOKEN_TIMEOUT = 30 * 24 * 60 * 60; // 30 days
  private readonly SESSION_TIMEOUT = 30 * 24 * 60 * 60; // 30 days
  private readonly MAX_CONCURRENT_SESSIONS = {
    resident: 3,
    manager: 2,
    admin: 5,
    security: 5,
    super_admin: 3
  };

  async createSession(userId: string, sessionData: Omit<SessionData, 'loginTime' | 'lastActivity' | 'refreshToken'>): Promise<{ sessionId: string; refreshToken: string }> {
    const sessionId = this.generateSessionId();
    const refreshToken = this.generateRefreshToken();
    const now = Date.now();
    
    const session: SessionData = {
      ...sessionData,
      loginTime: now,
      lastActivity: now,
      refreshToken
    };

    // Check concurrent sessions
    await this.enforceSessionLimit(userId, sessionData.role);
    
    // Store session and refresh token
    await saveToRedis(`session:${sessionId}`, session, this.SESSION_TIMEOUT);
    await saveToRedis(`refresh:${refreshToken}`, sessionId, this.REFRESH_TOKEN_TIMEOUT);
    await this.addUserSession(userId, sessionId);

    return { sessionId, refreshToken };
  }

  async validateSession(sessionId: string): Promise<SessionData | null> {
    const session = await getFromRedis<SessionData>(`session:${sessionId}`);
    if (!session) return null;

    session.lastActivity = Date.now();
    await saveToRedis(`session:${sessionId}`, session, this.SESSION_TIMEOUT);

    return session as SessionData;
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    return this.validateSession(sessionId);
  }

  async destroySession(sessionId: string): Promise<void> {
    const session = await getFromRedis<SessionData>(`session:${sessionId}`);
    if (session) {
      await this.removeUserSession(session.userId, sessionId);
    }
    await deleteFromRedis(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    return this.destroySession(sessionId);
  }

  private async enforceSessionLimit(userId: string, role: string = 'resident'): Promise<void> {
    const sessions = await getFromRedis<string[]>(`user_sessions:${userId}`);
    if (!sessions) return;
    const maxSessions = this.MAX_CONCURRENT_SESSIONS[role as keyof typeof this.MAX_CONCURRENT_SESSIONS] || 3;

    if (sessions.length >= maxSessions) {
      // Remove oldest session
      const oldestSession = sessions.shift();
      if (oldestSession) {
        await deleteFromRedis(`session:${oldestSession}`);
      }
    }
  }

  private async addUserSession(userId: string, sessionId: string): Promise<void> {
    const existing = await getFromRedis<string[]>(`user_sessions:${userId}`);
    const sessions: string[] = existing ?? [];

    sessions.push(sessionId);
    await saveToRedis(`user_sessions:${userId}`, sessions, this.SESSION_TIMEOUT);
  }

  private async removeUserSession(userId: string, sessionId: string): Promise<void> {
    const sessions = await getFromRedis<string[]>(`user_sessions:${userId}`);
    if (!sessions) return;

    const filteredSessions = sessions.filter(s => s !== sessionId);

    if (filteredSessions.length > 0) {
      await saveToRedis(`user_sessions:${userId}`, filteredSessions, this.SESSION_TIMEOUT);
    } else {
      await deleteFromRedis(`user_sessions:${userId}`);
    }
  }

  async refreshSession(refreshToken: string): Promise<{ sessionId: string; newRefreshToken: string } | null> {
    const sessionId = await getFromRedis<string>(`refresh:${refreshToken}`);
    if (!sessionId) return null;

    const session = await getFromRedis<SessionData>(`session:${sessionId}`);
    if (!session) return null;

    // Generate new tokens
    const newSessionId = this.generateSessionId();
    const newRefreshToken = this.generateRefreshToken();

    // Update session
    session.lastActivity = Date.now();
    session.refreshToken = newRefreshToken;

    // Store new session and refresh token
    await saveToRedis(`session:${newSessionId}`, session, this.SESSION_TIMEOUT);
    await saveToRedis(`refresh:${newRefreshToken}`, newSessionId, this.REFRESH_TOKEN_TIMEOUT);
    
    // Clean up old tokens
    await deleteFromRedis(`session:${sessionId}`);
    await deleteFromRedis(`refresh:${refreshToken}`);
    
    // Update user sessions list
    await this.removeUserSession(session.userId, sessionId);
    await this.addUserSession(session.userId, newSessionId);
    
    return { sessionId: newSessionId, newRefreshToken };
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  private generateRefreshToken(): string {
    return `ref_${Date.now()}_${Math.random().toString(36).slice(2, 18)}`;
  }
}

export default new SessionService();