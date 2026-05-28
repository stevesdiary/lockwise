/**
 * Input Validation Utilities
 * Prevents SQL injection, XSS, and other injection attacks
 */

export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Comprehensive input validators
 */
export const validators = {
  /**
   * Validate UUID format
   */
  uuid(value: string, fieldName: string = 'id'): string {
    if (!value) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new ValidationError(`Invalid ${fieldName} format`, fieldName, 'INVALID_UUID');
    }

    return value.toLowerCase();
  },

  /**
   * Validate email format
   */
  email(value: string, fieldName: string = 'email'): string {
    if (!value) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new ValidationError(`Invalid ${fieldName} format`, fieldName, 'INVALID_EMAIL');
    }

    // Additional checks
    if (value.length > 254) {
      throw new ValidationError(`${fieldName} is too long`, fieldName);
    }

    return value.toLowerCase().trim();
  },

  /**
   * Validate integer with optional min/max
   */
  integer(value: any, options: {
    fieldName?: string;
    min?: number;
    max?: number;
    required?: boolean;
  } = {}): number {
    const { fieldName = 'value', min, max, required = true } = options;

    if (value === null || value === undefined || value === '') {
      if (required) {
        throw new ValidationError(`${fieldName} is required`, fieldName);
      }
      return 0;
    }

    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new ValidationError(`${fieldName} must be a valid integer`, fieldName, 'INVALID_INTEGER');
    }

    if (min !== undefined && parsed < min) {
      throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName, 'VALUE_TOO_SMALL');
    }

    if (max !== undefined && parsed > max) {
      throw new ValidationError(`${fieldName} must be at most ${max}`, fieldName, 'VALUE_TOO_LARGE');
    }

    return parsed;
  },

  /**
   * Validate float/decimal with optional min/max
   */
  float(value: any, options: {
    fieldName?: string;
    min?: number;
    max?: number;
    required?: boolean;
  } = {}): number {
    const { fieldName = 'value', min, max, required = true } = options;

    if (value === null || value === undefined || value === '') {
      if (required) {
        throw new ValidationError(`${fieldName} is required`, fieldName);
      }
      return 0;
    }

    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      throw new ValidationError(`${fieldName} must be a valid number`, fieldName, 'INVALID_NUMBER');
    }

    if (min !== undefined && parsed < min) {
      throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName, 'VALUE_TOO_SMALL');
    }

    if (max !== undefined && parsed > max) {
      throw new ValidationError(`${fieldName} must be at most ${max}`, fieldName, 'VALUE_TOO_LARGE');
    }

    return parsed;
  },

  /**
   * Validate date string (YYYY-MM-DD format)
   */
  dateString(value: string, fieldName: string = 'date'): string {
    if (!value) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      throw new ValidationError(
        `Invalid ${fieldName} format. Expected YYYY-MM-DD`,
        fieldName,
        'INVALID_DATE_FORMAT'
      );
    }

    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      throw new ValidationError(`Invalid ${fieldName} value`, fieldName, 'INVALID_DATE');
    }

    // Check for reasonable date range (1900-2100)
    const year = parsed.getFullYear();
    if (year < 1900 || year > 2100) {
      throw new ValidationError(`${fieldName} year must be between 1900 and 2100`, fieldName);
    }

    return value;
  },

  /**
   * Validate ISO 8601 datetime string
   */
  datetime(value: string, fieldName: string = 'datetime'): string {
    if (!value) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      throw new ValidationError(`Invalid ${fieldName} format`, fieldName, 'INVALID_DATETIME');
    }

    return parsed.toISOString();
  },

  /**
   * Validate enum value
   */
  enum<T extends string>(value: string, allowedValues: T[], fieldName: string = 'value'): T {
    if (!value) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    if (!allowedValues.includes(value as T)) {
      throw new ValidationError(
        `${fieldName} must be one of: ${allowedValues.join(', ')}`,
        fieldName,
        'INVALID_ENUM_VALUE'
      );
    }

    return value as T;
  },

  /**
   * Validate string with length constraints
   */
  string(value: string, options: {
    fieldName?: string;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    required?: boolean;
    trim?: boolean;
  } = {}): string {
    const {
      fieldName = 'value',
      minLength,
      maxLength,
      pattern,
      required = true,
      trim = true
    } = options;

    if (!value || value.trim() === '') {
      if (required) {
        throw new ValidationError(`${fieldName} is required`, fieldName);
      }
      return '';
    }

    let processed = trim ? value.trim() : value;

    if (minLength !== undefined && processed.length < minLength) {
      throw new ValidationError(
        `${fieldName} must be at least ${minLength} characters`,
        fieldName,
        'STRING_TOO_SHORT'
      );
    }

    if (maxLength !== undefined && processed.length > maxLength) {
      throw new ValidationError(
        `${fieldName} must be at most ${maxLength} characters`,
        fieldName,
        'STRING_TOO_LONG'
      );
    }

    if (pattern && !pattern.test(processed)) {
      throw new ValidationError(
        `${fieldName} format is invalid`,
        fieldName,
        'INVALID_FORMAT'
      );
    }

    return processed;
  },

  /**
   * Validate phone number (E.164 format)
   */
  phone(value: string, fieldName: string = 'phone'): string {
    if (!value) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    // E.164 format: +[country code][number]
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const cleaned = value.replace(/[\s\-\(\)]/g, '');

    if (!phoneRegex.test(cleaned)) {
      throw new ValidationError(
        `Invalid ${fieldName} format. Expected E.164 format (e.g., +1234567890)`,
        fieldName,
        'INVALID_PHONE'
      );
    }

    return cleaned;
  },

  /**
   * Validate URL
   */
  url(value: string, fieldName: string = 'url'): string {
    if (!value) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    try {
      const parsed = new URL(value);
      
      // Only allow http and https
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        throw new Error('Invalid protocol');
      }

      return parsed.toString();
    } catch (error) {
      throw new ValidationError(`Invalid ${fieldName} format`, fieldName, 'INVALID_URL');
    }
  },

  /**
   * Validate boolean
   */
  boolean(value: any, fieldName: string = 'value'): boolean {
    if (value === null || value === undefined) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const lower = value.toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes') return true;
      if (lower === 'false' || lower === '0' || lower === 'no') return false;
    }

    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
    }

    throw new ValidationError(`Invalid ${fieldName} value`, fieldName, 'INVALID_BOOLEAN');
  },

  /**
   * Validate array
   */
  array<T>(value: any, options: {
    fieldName?: string;
    minLength?: number;
    maxLength?: number;
    itemValidator?: (item: any) => T;
  } = {}): T[] {
    const { fieldName = 'value', minLength, maxLength, itemValidator } = options;

    if (!Array.isArray(value)) {
      throw new ValidationError(`${fieldName} must be an array`, fieldName, 'INVALID_ARRAY');
    }

    if (minLength !== undefined && value.length < minLength) {
      throw new ValidationError(
        `${fieldName} must contain at least ${minLength} items`,
        fieldName,
        'ARRAY_TOO_SHORT'
      );
    }

    if (maxLength !== undefined && value.length > maxLength) {
      throw new ValidationError(
        `${fieldName} must contain at most ${maxLength} items`,
        fieldName,
        'ARRAY_TOO_LONG'
      );
    }

    if (itemValidator) {
      return value.map((item, index) => {
        try {
          return itemValidator(item);
        } catch (error) {
          if (error instanceof ValidationError) {
            throw new ValidationError(
              `${fieldName}[${index}]: ${error.message}`,
              `${fieldName}[${index}]`,
              error.code
            );
          }
          throw error;
        }
      });
    }

    return value;
  },

  /**
   * Validate pagination parameters
   */
  pagination(params: { page?: any; limit?: any }): { page: number; limit: number; offset: number } {
    const page = this.integer(params.page || 1, {
      fieldName: 'page',
      min: 1,
      required: false
    });

    const limit = this.integer(params.limit || 50, {
      fieldName: 'limit',
      min: 1,
      max: 100,
      required: false
    });

    const offset = (page - 1) * limit;

    return { page, limit, offset };
  },

  /**
   * Validate sort parameters
   */
  sort(value: string, allowedFields: string[], fieldName: string = 'sort'): { field: string; order: 'ASC' | 'DESC' } {
    if (!value) {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }

    const match = value.match(/^(-?)(.+)$/);
    if (!match) {
      throw new ValidationError(`Invalid ${fieldName} format`, fieldName, 'INVALID_SORT');
    }

    const [, prefix, field] = match;
    const order = prefix === '-' ? 'DESC' : 'ASC';

    if (!allowedFields.includes(field)) {
      throw new ValidationError(
        `${fieldName} field must be one of: ${allowedFields.join(', ')}`,
        fieldName,
        'INVALID_SORT_FIELD'
      );
    }

    return { field, order };
  }
};

/**
 * Sanitize string for safe output (prevent XSS)
 */
export function sanitizeString(value: string): string {
  if (!value) return '';
  
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize object for logging (remove sensitive fields)
 */
export function sanitizeForLogging(data: any): any {
  const sensitive = ['password', 'token', 'secret', 'apiKey', 'authorization', 'cookie'];
  
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeForLogging(item));
  }

  return Object.keys(data).reduce((acc, key) => {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      acc[key] = '[REDACTED]';
    } else if (typeof data[key] === 'object') {
      acc[key] = sanitizeForLogging(data[key]);
    } else {
      acc[key] = data[key];
    }
    return acc;
  }, {} as any);
}

/**
 * Validate and sanitize SQL LIKE pattern
 */
export function sanitizeLikePattern(pattern: string): string {
  if (!pattern) return '';
  
  // Escape special characters
  return pattern
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

export default validators;
