// Unit tests for user registration service and security invariants.
// Models are mocked via jest.mock — no DB required.

jest.mock('../../src/modules/auth/models/role.model', () => ({
  Role: { findAll: jest.fn().mockResolvedValue([]) },
}));

jest.mock('../../src/modules/auth/models/user.model', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../src/modules/estate/models/resident.model', () => ({
  Resident: { create: jest.fn() },
}));

jest.mock('../../src/modules/auth/services/email-verification.service', () => ({
  __esModule: true,
  default: { sendVerificationEmail: jest.fn().mockResolvedValue(undefined) },
}));

jest.mock('../../src/shared/core/database', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn((cb: (t: any) => Promise<any>) => cb({})),
  },
}));

import bcrypt from 'bcryptjs';
import { User } from '../../src/modules/auth/models/user.model';
import { registerUser } from '../../src/modules/auth/services/user.service';

const MockUser = User as jest.Mocked<typeof User>;

describe('registerUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-apply transaction mock — resetMocks:true clears implementations between tests
    const db = require('../../src/shared/core/database').default;
    (db.transaction as jest.Mock).mockImplementation((cb: (t: any) => Promise<any>) => cb({}));
    // Re-apply Role.findAll — needed so roleMapping resolves
    const { Role } = require('../../src/modules/auth/models/role.model');
    (Role.findAll as jest.Mock).mockResolvedValue([]);
  });

  it('should reject duplicate email with 400', async () => {
    (MockUser.findOne as jest.Mock).mockResolvedValue({ id: 'existing-user' });

    const result = await registerUser({
      email: 'existing@lockwise.com',
      password: 'Password123!',
      first_name: 'Test',
      last_name: 'User',
      phone: '+2348000000000',
      user_type: 'resident',
    });

    expect(result.statusCode).toBe(400);
    expect(result.message).toBe('User already exists');
    expect(MockUser.create).not.toHaveBeenCalled();
  });

  it('should hash the password with bcrypt rounds >= 12 before storing', async () => {
    (MockUser.findOne as jest.Mock).mockResolvedValue(null);

    let capturedHash = '';
    (MockUser.create as jest.Mock).mockImplementation(async (data: any) => {
      capturedHash = data.password;
      return { id: 'new-user-uuid', ...data };
    });

    const { Resident } = require('../../src/modules/estate/models/resident.model');
    (Resident.create as jest.Mock).mockResolvedValue({ resident_id: 'res-uuid' });

    await registerUser({
      email: 'newuser@lockwise.com',
      password: 'SecurePass123!',
      first_name: 'New',
      last_name: 'User',
      phone: '+2348000000001',
      user_type: 'resident',
    });

    expect(capturedHash).toMatch(/^\$2[ab]\$\d+\$/);
    expect(capturedHash).not.toBe('SecurePass123!');

    const rounds = bcrypt.getRounds(capturedHash);
    expect(rounds).toBeGreaterThanOrEqual(12);
  });

  it('should correctly verify the hashed password against the original', async () => {
    (MockUser.findOne as jest.Mock).mockResolvedValue(null);

    let capturedHash = '';
    (MockUser.create as jest.Mock).mockImplementation(async (data: any) => {
      capturedHash = data.password;
      return { id: 'new-user-uuid', ...data };
    });

    const { Resident } = require('../../src/modules/estate/models/resident.model');
    (Resident.create as jest.Mock).mockResolvedValue({ resident_id: 'res-uuid' });

    const plainPassword = 'MyPassword@99';
    await registerUser({
      email: 'verify@lockwise.com',
      password: plainPassword,
      first_name: 'Verify',
      last_name: 'Test',
      phone: '+2348000000002',
      user_type: 'resident',
    });

    const isValid = await bcrypt.compare(plainPassword, capturedHash);
    expect(isValid).toBe(true);

    const isWrong = await bcrypt.compare('WrongPassword', capturedHash);
    expect(isWrong).toBe(false);
  });
});

describe('bcrypt security invariants', () => {
  it('should use at least 12 rounds (brute-force resistance)', () => {
    const knownHash = bcrypt.hashSync('test', 12);
    expect(bcrypt.getRounds(knownHash)).toBeGreaterThanOrEqual(12);
  });

  it('should produce different hashes for the same password (salt uniqueness)', () => {
    const password = 'SamePassword123!';
    const hash1 = bcrypt.hashSync(password, 12);
    const hash2 = bcrypt.hashSync(password, 12);
    expect(hash1).not.toBe(hash2);
  });
});
