// Unit tests for gate service methods.
// All Sequelize models are mocked so tests run without a real DB.

jest.mock('../../src/modules/estate/models/gate.model', () => ({
  Gate: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
}));

import { Gate } from '../../src/modules/estate/models/gate.model';
import gateService from '../../src/modules/estate/services/gate.service';

const MockGate = Gate as jest.Mocked<typeof Gate>;

describe('GateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGate', () => {
    it('should return a gate with gate_code starting with GATE-', async () => {
      const fakeGate = {
        gate_id: 'gate-uuid-1234',
        estate_id: 'estate-uuid-5678',
        gate_code: 'GATE-ABC12345',
        gate_name: 'Main Gate',
        gate_type: 'main',
        access_control_type: 'manual',
        is_active: true,
      };

      (MockGate.create as jest.Mock).mockResolvedValue(fakeGate);

      const result = await gateService.createGate('estate-uuid-5678', {
        gate_name: 'Main Gate',
        gate_type: 'main',
        access_control_type: 'manual',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Gate created');
      expect(result.data.gate_code).toMatch(/^GATE-/);
      expect(result.data.gate_name).toBe('Main Gate');
      expect(result.data.gate_type).toBe('main');
      expect(MockGate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          gate_code: expect.stringMatching(/^GATE-[A-Z0-9]{8}$/),
        })
      );
    });

    it('should create gate with default access_control_type if not provided', async () => {
      const fakeGate = {
        gate_id: 'gate-uuid-1234',
        estate_id: 'estate-uuid-5678',
        gate_code: 'GATE-XYZ98765',
        gate_name: 'Service Gate',
        gate_type: 'service',
        access_control_type: 'manual',
        is_active: true,
      };

      (MockGate.create as jest.Mock).mockResolvedValue(fakeGate);

      const result = await gateService.createGate('estate-uuid-5678', {
        gate_name: 'Service Gate',
        gate_type: 'service',
      });

      expect(result.success).toBe(true);
      expect(MockGate.create).toHaveBeenCalledWith(
        expect.objectContaining({
          access_control_type: 'manual',
          is_active: true,
        })
      );
    });
  });

  describe('getGates', () => {
    it('should return an array of gates for an estate', async () => {
      const fakeGates = [
        {
          gate_id: 'gate-uuid-1',
          estate_id: 'estate-uuid-5678',
          gate_code: 'GATE-MAIN001',
          gate_name: 'Main Gate',
          gate_type: 'main',
          is_active: true,
        },
        {
          gate_id: 'gate-uuid-2',
          estate_id: 'estate-uuid-5678',
          gate_code: 'GATE-SERV002',
          gate_name: 'Service Gate',
          gate_type: 'service',
          is_active: true,
        },
      ];

      (MockGate.findAll as jest.Mock).mockResolvedValue(fakeGates);

      const result = await gateService.getGates('estate-uuid-5678');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Gates retrieved');
      expect(result.data).toEqual(fakeGates);
      expect(result.data.length).toBe(2);
      expect(MockGate.findAll).toHaveBeenCalledWith({
        where: { estate_id: 'estate-uuid-5678' },
        order: [['created_at', 'ASC']],
      });
    });

    it('should return empty array when no gates exist for estate', async () => {
      (MockGate.findAll as jest.Mock).mockResolvedValue([]);

      const result = await gateService.getGates('estate-uuid-empty');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });
});
