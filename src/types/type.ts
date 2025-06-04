import { Request, Response } from 'express';

export interface UserAttributes {
    first_name?: string;
    last_name?: string;
    email?: string;
    password?: string;
    confirm_password?: string;
}

export interface UserData extends Omit<UserAttributes, 'id'> {
  confirm_password?: string;
}

export interface TypedRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
  };
}

export interface VerifyRequest extends Request {
  body: {
    email: string;
    code: string;
  }
}

export interface UserData {
  name?: string;
  email?: string;
  password?: string;
  confirm_password?: string;
}

export interface UserResponse {
  statusCode: number;
  status: 'success' | 'fail' | 'error';
  message: string;
  data: string[] | null;
}

export interface UserController {
  create(req: TypedRequest, res: Response): Promise<Response>;
  updateUser(req: TypedRequest, res: Response): Promise<Response>;
}
export interface ServiceResponse {
  statusCode: number;
  status: string;
  message: string;
  data: unknown | any[];
}
export interface UserResponseData {
  statusCode: number;
  status: string, // 'success' | 'fail' | 'error';
  message: string;
  data: string[] | null;
}

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
};

export interface EmailResponse {
  statusCode: number;
  status: string;
  message: string;
  data: unknown;
}

export interface loginData {
  email: string;
  password: string;
}

export interface UserRole {
  id: string;
  email: string;
  role: string[];
}

export interface ValidationResult {
  email: string;
  code: string;
}

export interface VerificationResponse {
  statusCode: number;
  status: string;
  message: string;
  data?: unknown;
}

export interface VerificationRequestBody {
  email: string;
  code: string
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface SearchData {
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface ValidationErrorResponse {
  field: string;
  message: string;
}

// export interface AuthenticatedRequest extends Request {
//   user?: {
//     id: string;
//     email: string;
//     role: UserRole;
//   };
// }
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string[];
  };
}

export interface ApiResponse<T = any> {
  statusCode: number;
  status: 'success' | 'error' | 'fail';
  message: string;
  data: T | null;
}
