// Unit test for getOneEstate — verifies the method accepts estate_id alone (no estate_code required)
// We spy directly on the private estateRepository instance inside the service singleton.

jest.mock('../../src/modules/payment/models/referrer.model', () => ({
  Referrer: { findOne: jest.fn() },
}));
jest.mock('../../src/modules/estate/models/estate.model', () => ({
  Estate: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
}));
jest.mock('../../src/modules/auth/models/user.model', () => ({
  User: { update: jest.fn() },
}));

import { Estate } from '../../src/modules/estate/models/estate.model';
import { User } from '../../src/modules/auth/models/user.model';
import estateService from '../../src/modules/estate/services/estate.service';

const MockUser = User as jest.Mocked<typeof User>;

const MockEstate = Estate as jest.Mocked<typeof Estate>;

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

    // Verify the service actually passed draft fields to the repository
    expect(MockEstate.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'draft',
        onboarding_step: 1,
        setup_checklist: { gates_configured: false, residents_invited: false },
      })
    );

    // Verify user estate_id was linked
    expect(MockUser.update).toHaveBeenCalledWith(
      { estate_id: 'new-estate-uuid' },
      { where: { id: 'test-user-uuid' } }
    );
  });
});
