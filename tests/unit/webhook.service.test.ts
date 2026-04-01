// Unit tests for Paystack webhook service.
// All Sequelize models and external services are mocked — no DB required.

import crypto from 'crypto';

jest.mock('../../src/shared/core/database', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn((opts: any, cb: any) => {
      // Support both (opts, cb) and (cb) signatures
      const fn = typeof opts === 'function' ? opts : cb;
      return fn({});
    }),
  },
}));

jest.mock('../../src/modules/payment/models/payment.model', () => ({
  Payment: {
    update: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.mock('../../src/modules/payment/models/subscription.model', () => ({
  Subscription: {
    findOne: jest.fn(),
    create: jest.fn(),
    upsert: jest.fn(),
  },
}));

jest.mock('../../src/modules/payment/models/plan.model', () => ({
  Plan: { findByPk: jest.fn() },
}));

jest.mock('../../src/modules/estate/models/estate.model', () => ({
  Estate: { findByPk: jest.fn() },
}));

jest.mock('../../src/modules/auth/models/user.model', () => ({
  User: { findByPk: jest.fn() },
}));

jest.mock('../../src/modules/payment/services/referral.service', () => ({
  referralService: { createBonusOnPayment: jest.fn().mockResolvedValue(undefined) },
}));

import { Payment } from '../../src/modules/payment/models/payment.model';
import { webhookService } from '../../src/modules/payment/services/webhook.service';

const MockPayment = Payment as jest.Mocked<typeof Payment>;

const FAKE_SECRET = 'test_paystack_secret_key';

beforeAll(() => {
  process.env.PAYSTACK_SECRET_KEY = FAKE_SECRET;
});

afterAll(() => {
  delete process.env.PAYSTACK_SECRET_KEY;
});

describe('webhookService.verifyPaystackSignature', () => {
  it('should return true for a valid HMAC-SHA512 signature', () => {
    const payload = { event: 'charge.success', data: { reference: 'LW_abc123_1234567890' } };
    const signature = crypto
      .createHmac('sha512', FAKE_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    expect(webhookService.verifyPaystackSignature(payload, signature)).toBe(true);
  });

  it('should return false for a tampered payload', () => {
    const payload = { event: 'charge.success', data: { reference: 'LW_abc123_1234567890' } };
    const signature = crypto
      .createHmac('sha512', FAKE_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    const tamperedPayload = { ...payload, data: { reference: 'DIFFERENT_REF' } };
    expect(webhookService.verifyPaystackSignature(tamperedPayload, signature)).toBe(false);
  });

  it('should return false for a wrong signature string', () => {
    const payload = { event: 'charge.success', data: { reference: 'LW_abc123_1234567890' } };
    expect(webhookService.verifyPaystackSignature(payload, 'not_a_real_signature')).toBe(false);
  });

  it('should throw when PAYSTACK_SECRET_KEY is not set', () => {
    const saved = process.env.PAYSTACK_SECRET_KEY;
    delete process.env.PAYSTACK_SECRET_KEY;
    expect(() => webhookService.verifyPaystackSignature({}, 'sig')).toThrow('PAYSTACK_SECRET_KEY not configured');
    process.env.PAYSTACK_SECRET_KEY = saved;
  });
});

describe('webhookService.processPaystackWebhook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-apply transaction mock — resetMocks:true clears implementations between tests
    const db = require('../../src/shared/core/database').default;
    (db.transaction as jest.Mock).mockImplementation((opts: any, cb: any) => {
      const fn = typeof opts === 'function' ? opts : cb;
      return fn({});
    });
  });

  it('should return 400 when charge.success has no reference', async () => {
    const result = await webhookService.processPaystackWebhook('charge.success', {});
    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(400);
    expect(result.message).toBe('Missing payment reference');
  });

  it('should return 404 when payment reference is not found in DB', async () => {
    (MockPayment.update as jest.Mock).mockResolvedValue([0]);
    (MockPayment.findOne as jest.Mock).mockResolvedValue(null);

    const result = await webhookService.processPaystackWebhook('charge.success', {
      reference: 'LW_notfound_123',
      amount: 5000,
    });

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(404);
  });

  it('should return 200 and update payment on a valid charge.success', async () => {
    const fakePayment = {
      id: 'payment-uuid',
      reference: 'LW_test_123',
      estate_id: 'estate-uuid',
      subscription_id: 'sub-uuid',
    };

    (MockPayment.update as jest.Mock).mockResolvedValue([1]);
    (MockPayment.findOne as jest.Mock).mockResolvedValue(fakePayment);

    // Mock createOrExtendSubscription path — Subscription.findOne returns null (new sub)
    const { Subscription } = require('../../src/modules/payment/models/subscription.model');
    Subscription.findOne.mockResolvedValue(null);
    Subscription.create.mockResolvedValue({ subscription_id: 'new-sub-uuid', status: 'active' });

    // Plan.findByPk not needed for basic flow
    const result = await webhookService.processPaystackWebhook('charge.success', {
      reference: 'LW_test_123',
      amount: 50000,
    });

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(200);
    expect(MockPayment.update).toHaveBeenCalledWith(
      expect.objectContaining({ payment_status: 'completed' }),
      expect.objectContaining({ where: { reference: 'LW_test_123' } })
    );
  });

  it('should return 200 for unhandled events without touching the DB', async () => {
    const result = await webhookService.processPaystackWebhook('subscription.disable', {
      reference: 'LW_test_999',
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe('Event not handled');
    expect(MockPayment.update).not.toHaveBeenCalled();
  });
});
