export interface ValidationError extends Error {
  name: string;
  message: string;
  errors: Record<string, any>;
}

export interface ValidationErrorResponse {
  status: 'error';
  message: string;
  errors: ValidationError[];
}
export interface ValidationSuccessResponse {
  status: 'success';
  message: string;
  data?: any;
}

export interface AggregateError {
  name: string;
  message: string;
  errors: Error[];
}