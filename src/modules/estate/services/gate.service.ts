import { customAlphabet } from 'nanoid';
import { Gate } from '../models/gate.model';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

export interface GateInput {
  gate_name: string;
  gate_type: 'main' | 'service' | 'pedestrian' | 'emergency' | 'vip';
  access_control_type?: 'manual' | 'rfid' | 'biometric' | 'qr_code' | 'hybrid';
}

class GateService {
  async createGate(
    estateId: string,
    data: GateInput
  ): Promise<{ success: boolean; message: string; data: any; statusCode?: number }> {
    try {
      const gate_code = `GATE-${nanoid()}`;
      const gate = await Gate.create({
        estate_id: estateId,
        gate_code,
        gate_name: data.gate_name,
        gate_type: data.gate_type,
        access_control_type: data.access_control_type || 'manual',
        is_active: true,
      });
      return { success: true, message: 'Gate created', data: gate };
    } catch (error) {
      throw error;
    }
  }

  async getGates(
    estateId: string
  ): Promise<{ success: boolean; message: string; data: any }> {
    try {
      const gates = await Gate.findAll({
        where: { estate_id: estateId },
        order: [['created_at', 'ASC']],
      });
      return { success: true, message: 'Gates retrieved', data: gates };
    } catch (error) {
      throw error;
    }
  }
}

export default new GateService();
