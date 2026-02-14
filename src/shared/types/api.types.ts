export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page: number;
  limit: number;
  total: number;
}
