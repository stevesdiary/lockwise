/**
 * Central export point for all mock services
 */

import { resetRedisMock } from './redis.mock';
import { resetPaystackMock } from './paystack.mock';
import { resetEmailMock } from './email.mock';

export * from './redis.mock';
export * from './paystack.mock';
export * from './email.mock';

/**
 * Resets all mocks to initial state
 */
export const resetAllServiceMocks = () => {
  resetRedisMock();
  resetPaystackMock();
  resetEmailMock();
};
