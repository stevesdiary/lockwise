import { getFromRedis, saveToRedis, deleteFromRedis } from '../core/redis';

interface SessionData {
  userId: string;
  estateId: string;
  role: string;
  loginTime: number;
  lastActivity: number;
}

class SessionService {
  private readonly SESSION_TIMEOUT = 24 * 60 * 60; // 24 hours
  private readonly MAX_CONCURRENT_SESSIONS = 3;

  async createSession(userId: string, sessionData: Omit<SessionData, 'loginTime' | 'lastActivity'>): Promise<string> {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    
    const session: SessionData = {
      ...sessionData,
      loginTime: now,
      lastActivity: now
    };

    // Check concurrent sessions
    await this.enforceSessionLimit(userId);
    
    // Store session
    await saveToRedis(`session:${sessionId}`, JSON.stringify(session), this.SESSION_TIMEOUT);
    await this.addUserSession(userId, sessionId);

    return sessionId;
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

  private async enforceSessionLimit(userId: string): Promise<void> {
    const userSessionsData = await getFromRedis(`user_sessions:${userId}`);
    if (!userSessionsData) return;

    const sessions: string[] = JSON.parse(userSessionsData);
    if (sessions.length >= this.MAX_CONCURRENT_SESSIONS) {
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

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new SessionService();