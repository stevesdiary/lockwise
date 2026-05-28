declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: import('./modules/auth/types/user.types').UserRole;
      sessionId: string;
      estate_id?: string;
      verified?: boolean;
    }

    interface Request {
      user?: User;
      startTime?: number;
    }
  }
}

export {};
