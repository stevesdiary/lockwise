// Unit tests for estate service methods.
// All Sequelize models are mocked so tests run without a real DB.

jest.mock('../../src/modules/payment/models/referrer.model', () => ({
  Referrer: { findOne: jest.fn() },
}));
jest.mock('../../src/modules/estate/models/estate.model', () => ({
  Estate: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  },
}));
jest.mock('../../src/modules/auth/models/user.model', () => ({
  User: {
    update: jest.fn(),
    findAll: jest.fn(),
  },
}));
jest.mock('../../src/modules/auth/models/role.model', () => ({
  Role: {
    findAll: jest.fn(),
  },
}));
jest.mock('../../src/shared/core/database', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn((cb: (t: any) => Promise<any>) => cb({ /* mock transaction */ })),
  },
}));
jest.mock('../../src/modules/communication/services/email.service', () => ({
  __esModule: true,
  default: {
    sendEstateSubmittedEmail: jest.fn().mockResolvedValue(true),
  },
}));
jest.mock('../../src/modules/communication/services/notification.service', () => ({
  __esModule: true,
  default: {
    sendNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

import { Estate } from '../../src/modules/estate/models/estate.model';
import { User } from '../../src/modules/auth/models/user.model';
import { Role } from '../../src/modules/auth/models/role.model';
import estateService from '../../src/modules/estate/services/estate.service';

const MockUser = User as jest.Mocked<typeof User>;
const MockEstate = Estate as jest.Mocked<typeof Estate>;
const MockRole = Role as jest.Mocked<typeof Role>;

// Helper: spy on the private estateRepository inside the service singleton
// The repository calls Estate.findByPk; we mock that directly.

describe('getOneEstate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return estate when given only estate_id (no estate_code)', async () => {
    const fakeEstate = {
      estate_id: 'test-estate-uuid-1234',
      name: 'ID-Only Test Estate',
      estate_code: 'EST123456',
    };

    // The repository calls Estate.findByPk internally
    (MockEstate.findByPk as jest.Mock).mockResolvedValue(fakeEstate);

    // Act: ID only, no estate_code — this is the core of the bug fix
    const result = await estateService.getOneEstate('test-estate-uuid-1234');

    expect(result?.success).toBe(true);
    expect(result?.data?.estate_id).toBe('test-estate-uuid-1234');
    expect(MockEstate.findByPk).toHaveBeenCalledWith('test-estate-uuid-1234');
  });

  it('should return failure when estate_id is empty string', async () => {
    const result = await estateService.getOneEstate('');

    expect(result?.success).toBe(false);
    expect(result?.message).toBe('Estate ID is required');
  });

  it('should return failure when estate is not found', async () => {
    (MockEstate.findByPk as jest.Mock).mockResolvedValue(null);

    const result = await estateService.getOneEstate('nonexistent-uuid');

    expect(result?.success).toBe(false);
    expect(result?.message).toBe('Estate not found');
  });
});

describe('createEstate (draft)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create estate as draft with initialized setup_checklist', async () => {
    const fakeEstate = {
      estate_id: 'new-estate-uuid',
      name: 'Draft Estate',
      status: 'draft',
      onboarding_step: 1,
      setup_checklist: { gates_configured: false, residents_invited: false },
    };

    (MockEstate.create as jest.Mock).mockResolvedValue(fakeEstate);
    (MockUser.update as jest.Mock).mockResolvedValue([1]);

    const result = await estateService.createEstate({
      name: 'Draft Estate',
      type: 'residential',
      city: 'Abuja',
      state: 'FCT',
      country: 'Nigeria',
      country_code: 'NG',
      timezone: 'Africa/Lagos',
      currency_code: 'NGN',
      estate_code: `EST${Date.now()}`,
      total_number_of_apartments: 20,
      created_by: 'test-user-uuid',
    });

    expect(result.success).toBe(true);
    expect(result.data.status).toBe('draft');
    expect(result.data.setup_checklist).toEqual({ gates_configured: false, residents_invited: false });
    expect(result.data.onboarding_step).toBe(1);

    // Verify the service actually passed draft fields to the repository (transaction is second arg)
    expect(MockEstate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'draft',
        onboarding_step: 1,
        setup_checklist: { gates_configured: false, residents_invited: false },
      }),
      expect.objectContaining({ transaction: expect.anything() })
    );

    // Verify user estate_id was linked (transaction is included in options)
    expect(MockUser.update).toHaveBeenCalledWith(
      { estate_id: 'new-estate-uuid' },
      expect.objectContaining({ where: { id: 'test-user-uuid' }, transaction: expect.anything() })
    );
  });
});

describe('updateOnboardingStep', () => {
  const estateId = 'test-estate-uuid';
  const userId = 'test-user-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: estate repository (findByPk) returns a draft estate
    (MockEstate.findByPk as jest.Mock).mockResolvedValue({
      estate_id: estateId,
      name: 'Test Estate',
      status: 'draft',
      onboarding_step: 1,
    });
    (MockEstate.update as jest.Mock).mockResolvedValue([1]);
    (MockRole.findAll as jest.Mock).mockResolvedValue([]);
    (MockUser.findAll as jest.Mock).mockResolvedValue([]);
  });

  it('should advance onboarding_step and return success', async () => {
    const result = await estateService.updateOnboardingStep(estateId, userId, 2);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Onboarding step updated');
    expect(MockEstate.update).toHaveBeenCalledWith(
      expect.objectContaining({ onboarding_step: 2 }),
      expect.objectContaining({ where: { estate_id: estateId } })
    );
  });

  it('should flip status to pending when status="pending" passed on a draft estate', async () => {
    const result = await estateService.updateOnboardingStep(estateId, userId, 3, 'pending');

    expect(result.success).toBe(true);
    expect(MockEstate.update).toHaveBeenCalledWith(
      expect.objectContaining({ onboarding_step: 3, status: 'pending' }),
      expect.objectContaining({ where: { estate_id: estateId } })
    );
  });

  it('should return 409 if estate is already in pending status', async () => {
    // Override the mock to simulate estate already in 'pending' status
    (MockEstate.findByPk as jest.Mock).mockResolvedValue({
      estate_id: estateId,
      name: 'Test Estate',
      status: 'pending',
      onboarding_step: 3,
    });

    const result = await estateService.updateOnboardingStep(estateId, userId, 3, 'pending');

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(409);
    expect(result.message).toBe('Estate is not in draft status');
  });

  it('should return 404 if estate is not found', async () => {
    (MockEstate.findByPk as jest.Mock).mockResolvedValue(null);

    const result = await estateService.updateOnboardingStep('nonexistent-id', userId, 2);

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(404);
    expect(result.message).toBe('Estate not found');
  });

  it('should not set status when status argument is omitted', async () => {
    await estateService.updateOnboardingStep(estateId, userId, 2);

    const updateCall = (MockEstate.update as jest.Mock).mock.calls[0][0];
    expect(updateCall).not.toHaveProperty('status');
  });

  it('should attempt to notify admins when flipping to pending', async () => {
    const mockAdminRole = { id: 'role-admin-uuid' };
    const mockAdmin = { email: 'admin@lockwise.com', first_name: 'Admin' };
    (MockRole.findAll as jest.Mock).mockResolvedValue([mockAdminRole]);
    (MockUser.findAll as jest.Mock).mockResolvedValue([mockAdmin]);

    const emailService = require('../../src/modules/communication/services/email.service').default;
    const notificationService = require('../../src/modules/communication/services/notification.service').default;

    await estateService.updateOnboardingStep(estateId, userId, 3, 'pending');

    expect(MockRole.findAll).toHaveBeenCalled();
    expect(MockUser.findAll).toHaveBeenCalled();
    expect(emailService.sendEstateSubmittedEmail).toHaveBeenCalledWith(
      'admin@lockwise.com',
      expect.objectContaining({ estate_name: 'Test Estate' })
    );
    expect(notificationService.sendNotification).toHaveBeenCalled();
  });
});

describe('updateSetupChecklist', () => {
  const estateId = 'test-estate-uuid';
  const userId = 'test-user-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: estate repository (findByPk) returns an estate with initialized checklist
    (MockEstate.findByPk as jest.Mock).mockResolvedValue({
      estate_id: estateId,
      name: 'Test Estate',
      status: 'draft',
      setup_checklist: { gates_configured: false, residents_invited: false },
    });
    (MockEstate.update as jest.Mock).mockResolvedValue([1]);
  });

  it('should update gates_configured without touching residents_invited', async () => {
    const result = await estateService.updateSetupChecklist(
      estateId, userId, { gates_configured: true }
    );
    expect(result.success).toBe(true);
    expect(result.message).toBe('Setup checklist updated');

    // Verify Estate.update was called with merged checklist
    expect(MockEstate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        setup_checklist: { gates_configured: true, residents_invited: false }
      }),
      expect.objectContaining({ where: { estate_id: estateId } })
    );
  });

  it('should update residents_invited without touching gates_configured', async () => {
    const result = await estateService.updateSetupChecklist(
      estateId, userId, { residents_invited: true }
    );
    expect(result.success).toBe(true);

    expect(MockEstate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        setup_checklist: { gates_configured: false, residents_invited: true }
      }),
      expect.objectContaining({ where: { estate_id: estateId } })
    );
  });

  it('should update both fields when both provided', async () => {
    const result = await estateService.updateSetupChecklist(
      estateId, userId, { gates_configured: true, residents_invited: true }
    );
    expect(result.success).toBe(true);

    expect(MockEstate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        setup_checklist: { gates_configured: true, residents_invited: true }
      }),
      expect.objectContaining({ where: { estate_id: estateId } })
    );
  });

  it('should return 404 if estate is not found', async () => {
    (MockEstate.findByPk as jest.Mock).mockResolvedValue(null);

    const result = await estateService.updateSetupChecklist(
      'nonexistent-id', userId, { gates_configured: true }
    );

    expect(result.success).toBe(false);
    expect(result.statusCode).toBe(404);
    expect(result.message).toBe('Estate not found');
  });

  it('should initialize checklist if currently null', async () => {
    (MockEstate.findByPk as jest.Mock).mockResolvedValue({
      estate_id: estateId,
      name: 'Test Estate',
      status: 'draft',
      setup_checklist: null,
    });

    const result = await estateService.updateSetupChecklist(
      estateId, userId, { gates_configured: true }
    );
    expect(result.success).toBe(true);

    expect(MockEstate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        setup_checklist: { gates_configured: true, residents_invited: false }
      }),
      expect.objectContaining({ where: { estate_id: estateId } })
    );
  });
});
