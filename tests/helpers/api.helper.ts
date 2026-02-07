import request from 'supertest';
import { Application } from 'express';

/**
 * Makes an authenticated GET request
 * @param app - Express application
 * @param url - Request URL
 * @param token - JWT token
 * @returns Supertest response
 */
export const authenticatedGet = (app: Application, url: string, token: string) => {
  return request(app).get(url).set('Authorization', `Bearer ${token}`);
};

/**
 * Makes an authenticated POST request
 * @param app - Express application
 * @param url - Request URL
 * @param token - JWT token
 * @param data - Request body
 * @returns Supertest response
 */
export const authenticatedPost = (
  app: Application,
  url: string,
  token: string,
  data: any
) => {
  return request(app)
    .post(url)
    .set('Authorization', `Bearer ${token}`)
    .send(data);
};

/**
 * Makes an authenticated PUT request
 * @param app - Express application
 * @param url - Request URL
 * @param token - JWT token
 * @param data - Request body
 * @returns Supertest response
 */
export const authenticatedPut = (
  app: Application,
  url: string,
  token: string,
  data: any
) => {
  return request(app)
    .put(url)
    .set('Authorization', `Bearer ${token}`)
    .send(data);
};

/**
 * Makes an authenticated PATCH request
 * @param app - Express application
 * @param url - Request URL
 * @param token - JWT token
 * @param data - Request body
 * @returns Supertest response
 */
export const authenticatedPatch = (
  app: Application,
  url: string,
  token: string,
  data: any
) => {
  return request(app)
    .patch(url)
    .set('Authorization', `Bearer ${token}`)
    .send(data);
};

/**
 * Makes an authenticated DELETE request
 * @param app - Express application
 * @param url - Request URL
 * @param token - JWT token
 * @returns Supertest response
 */
export const authenticatedDelete = (app: Application, url: string, token: string) => {
  return request(app).delete(url).set('Authorization', `Bearer ${token}`);
};

/**
 * Extracts error message from response
 * @param response - Supertest response
 * @returns Error message
 */
export const getErrorMessage = (response: any): string => {
  return response.body?.error || response.body?.message || 'Unknown error';
};

/**
 * Checks if response is successful (2xx status)
 * @param response - Supertest response
 * @returns True if successful
 */
export const isSuccessResponse = (response: any): boolean => {
  return response.status >= 200 && response.status < 300;
};

/**
 * Checks if response is an error (4xx or 5xx status)
 * @param response - Supertest response
 * @returns True if error
 */
export const isErrorResponse = (response: any): boolean => {
  return response.status >= 400;
};

/**
 * Waits for a specified duration (for testing async operations)
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after delay
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Makes multiple requests in parallel
 * @param requests - Array of request promises
 * @returns Array of responses
 */
export const parallelRequests = async (requests: Promise<any>[]): Promise<any[]> => {
  return Promise.all(requests);
};

/**
 * Retries a request up to maxRetries times
 * @param requestFn - Function that returns a request promise
 * @param maxRetries - Maximum number of retries
 * @param delayMs - Delay between retries in milliseconds
 * @returns Response from successful request
 */
export const retryRequest = async (
  requestFn: () => Promise<any>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<any> => {
  let lastError: any;

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await requestFn();
      if (isSuccessResponse(response)) {
        return response;
      }
      lastError = response;
    } catch (error) {
      lastError = error;
    }

    if (i < maxRetries) {
      await wait(delayMs);
    }
  }

  throw lastError;
};

/**
 * Validates response has expected structure
 * @param response - Supertest response
 * @param expectedKeys - Array of expected keys in response body
 * @returns True if all keys present
 */
export const validateResponseStructure = (
  response: any,
  expectedKeys: string[]
): boolean => {
  if (!response.body) return false;
  return expectedKeys.every((key) => key in response.body);
};

/**
 * Creates a multipart form data request
 * @param app - Express application
 * @param url - Request URL
 * @param token - JWT token
 * @param fields - Form fields
 * @param files - Files to upload
 * @returns Supertest request
 */
export const uploadFile = (
  app: Application,
  url: string,
  token: string,
  fields: Record<string, any> = {},
  files: Array<{ field: string; path: string }> = []
) => {
  let req = request(app).post(url).set('Authorization', `Bearer ${token}`);

  // Add form fields
  Object.entries(fields).forEach(([key, value]) => {
    req = req.field(key, value);
  });

  // Add files
  files.forEach(({ field, path }) => {
    req = req.attach(field, path);
  });

  return req;
};
