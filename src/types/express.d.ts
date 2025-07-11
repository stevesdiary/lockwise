import { JwtPayload } from '../../modules/types/type'

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      email: string,
      role: string
    };
  }
}
export { JwtPayload };
