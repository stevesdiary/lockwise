export interface ApiResponse<T = any> {
  status: 'success' | 'fail' | 'error';
  statusCode: number;
  message: string;
  data?: T;
  errors?: Array<{
    field?: string;
    message: string;
  }>;
}

export interface PaginatedApiResponse<T> extends ApiResponse<PaginationData<T>> {
  data:PaginationData<T>;
}

export interface PaginationData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface ValidationError {
  field: string;
  message: string;
}
