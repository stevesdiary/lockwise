import { getFromRedis, saveToRedis, deleteFromRedis } from '../core/redis';

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
  private readonly ACCESS_TOKEN_TIMEOUT = 15 * 60; // 15 minutes
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
    await saveToRedis(`session:${sessionId}`, JSON.stringify(session), this.SESSION_TIMEOUT);
    await saveToRedis(`refresh:${refreshToken}`, sessionId, this.REFRESH_TOKEN_TIMEOUT);
    await this.addUserSession(userId, sessionId);

    return { sessionId, refreshToken };
  }

  async validateSession(sessionId: string): Promise<SessionData | null> {
    const sessionData = await getFromRedis(`session:${sessionId}`);
    if (!sessionData) return null;

    const session: SessionData = JSON.parse(sessionData);
    
    // Update last activity
    session.lastActivity = Date.now();
    await saveToRedis(`session:${sessionId}`, JSON.stringify(session), this.SESSION_TIMEOUT);

    return session;
  }

  async destroySession(sessionId: string): Promise<void> {
    const sessionData = await getFromRedis(`session:${sessionId}`);
    if (sessionData) {
      const session: SessionData = JSON.parse(sessionData);
      await this.removeUserSession(session.userId, sessionId);
    }
    await deleteFromRedis(`session:${sessionId}`);
  }

  private async enforceSessionLimit(userId: string, role: string = 'resident'): Promise<void> {
    const userSessionsData = await getFromRedis(`user_sessions:${userId}`);
    if (!userSessionsData) return;

    const sessions: string[] = JSON.parse(userSessionsData);
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
    const userSessionsData = await getFromRedis(`user_sessions:${userId}`);
    const sessions: string[] = userSessionsData ? JSON.parse(userSessionsData) : [];
    
    sessions.push(sessionId);
    await saveToRedis(`user_sessions:${userId}`, JSON.stringify(sessions), this.SESSION_TIMEOUT);
  }

  private async removeUserSession(userId: string, sessionId: string): Promise<void> {
    const userSessionsData = await getFromRedis(`user_sessions:${userId}`);
    if (!userSessionsData) return;

    const sessions: string[] = JSON.parse(userSessionsData);
    const filteredSessions = sessions.filter(s => s !== sessionId);
    
    if (filteredSessions.length > 0) {
      await saveToRedis(`user_sessions:${userId}`, JSON.stringify(filteredSessions), this.SESSION_TIMEOUT);
    } else {
      await deleteFromRedis(`user_sessions:${userId}`);
    }
  }

  async refreshSession(refreshToken: string): Promise<{ sessionId: string; newRefreshToken: string } | null> {
    const sessionId = await getFromRedis(`refresh:${refreshToken}`);
    if (!sessionId) return null;

    const sessionData = await getFromRedis(`session:${sessionId}`);
    if (!sessionData) return null;

    const session: SessionData = JSON.parse(sessionData);
    
    // Generate new tokens
    const newSessionId = this.generateSessionId();
    const newRefreshToken = this.generateRefreshToken();
    
    // Update session
    session.lastActivity = Date.now();
    session.refreshToken = newRefreshToken;
    
    // Store new session and refresh token
    await saveToRedis(`session:${newSessionId}`, JSON.stringify(session), this.SESSION_TIMEOUT);
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
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRefreshToken(): string {
    return `ref_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }
}

export default new SessionService();