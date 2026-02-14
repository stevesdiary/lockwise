import { UserRole } from '../modules/auth/types/user.types';

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: UserRole;
      sessionId: string;
      estate_id?: string;
    }
    
    interface Request {
      user?: User;
      startTime?: number;
    }
  }
}

export {};
