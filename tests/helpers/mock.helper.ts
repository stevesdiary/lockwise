/**
 * Creates a mock function that resolves with provided data
 * @param data - Data to resolve with
 * @returns Jest mock function
 */
export const createMockResolve = (data: any) => {
  return jest.fn().mockResolvedValue(data);
};

/**
 * Creates a mock function that rejects with provided error
 * @param error - Error to reject with
 * @returns Jest mock function
 */
export const createMockReject = (error: any) => {
  return jest.fn().mockRejectedValue(error);
};

/**
 * Creates a mock function that returns different values on consecutive calls
 * @param values - Array of values to return
 * @returns Jest mock function
 */
export const createMockSequence = (...values: any[]) => {
  const mock = jest.fn();
  values.forEach((value) => {
    if (value instanceof Error) {
      mock.mockRejectedValueOnce(value);
    } else {
      mock.mockResolvedValueOnce(value);
    }
  });
  return mock;
};

/**
 * Creates a spy on an object method
 * @param object - Object containing the method
 * @param method - Method name to spy on
 * @returns Jest spy
 */
export const createSpy = (object: any, method: string) => {
  return jest.spyOn(object, method);
};

/**
 * Restores all mocks to their original implementation
 */
export const restoreAllMocks = () => {
  jest.restoreAllMocks();
};

/**
 * Clears all mock call history
 */
export const clearAllMocks = () => {
  jest.clearAllMocks();
};

/**
 * Resets all mocks to initial state
 */
export const resetAllMocks = () => {
  jest.resetAllMocks();
};

/**
 * Creates a mock timer for testing time-dependent code
 */
export const useFakeTimers = () => {
  jest.useFakeTimers();
};

/**
 * Restores real timers
 */
export const useRealTimers = () => {
  jest.useRealTimers();
};

/**
 * Advances timers by specified time
 * @param ms - Milliseconds to advance
 */
export const advanceTimersByTime = (ms: number) => {
  jest.advanceTimersByTime(ms);
};

/**
 * Runs all pending timers
 */
export const runAllTimers = () => {
  jest.runAllTimers();
};

/**
 * Creates a mock service with common methods
 * @param methods - Object containing method implementations
 * @returns Mock service object
 */
export const createMockService = (methods: Record<string, any> = {}) => {
  const mockService: Record<string, jest.Mock> = {};

  Object.entries(methods).forEach(([key, value]) => {
    mockService[key] = jest.fn().mockResolvedValue(value);
  });

  return mockService;
};

/**
 * Verifies a mock was called with specific arguments
 * @param mock - Jest mock function
 * @param args - Expected arguments
 */
export const expectCalledWith = (mock: jest.Mock, ...args: any[]) => {
  expect(mock).toHaveBeenCalledWith(...args);
};

/**
 * Verifies a mock was called n times
 * @param mock - Jest mock function
 * @param times - Expected call count
 */
export const expectCalledTimes = (mock: jest.Mock, times: number) => {
  expect(mock).toHaveBeenCalledTimes(times);
};

/**
 * Verifies a mock was never called
 * @param mock - Jest mock function
 */
export const expectNotCalled = (mock: jest.Mock) => {
  expect(mock).not.toHaveBeenCalled();
};
