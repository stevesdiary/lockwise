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

import { Estate } from '../../src/modules/estate/models/estate.model';
import estateService from '../../src/modules/estate/services/estate.service';

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
