// Mock heavy/broken dependencies before importing the server
jest.mock('../../src/shared/core/database', () => ({
  __esModule: true,
  default: { authenticate: jest.fn(), close: jest.fn() },
  databaseTarget: 'test-db',
  runMigrations: jest.fn(),
}));

jest.mock('../../src/router', () => ({
  __esModule: true,
  default: require('express').Router(),
}));

jest.mock('../../src/modules/communication/services/websocket.service', () => {
  return { __esModule: true, default: jest.fn().mockImplementation(() => ({})) };
});

jest.mock('../../src/shared/config/swagger', () => ({
  swaggerUi: { serve: [], setup: () => (_req: any, _res: any, next: any) => next() },
  specs: {},
}));

jest.mock('../../src/shared/middleware/monitoring', () => ({
  __esModule: true,
  default: { middleware: () => (_req: any, _res: any, next: any) => next() },
}));

jest.mock('../../src/shared/jobs/access-code-expiry.job', () => ({
  startAccessCodeExpiryJob: jest.fn(),
}));

jest.mock('../../src/shared/jobs/subscription-expiry.job', () => ({
  startSubscriptionExpiryJob: jest.fn(),
}));

import request from 'supertest';
import { server } from '../../src/shared/core';

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(server).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});
