import { nanoid } from 'nanoid';
import { SmartMeter } from '../models/smart-meter.model';
import { ElectricityTransactionRecord } from '../models/electricity-transaction.model';
import { User } from '../../auth/models/user.model';
import billsService from '../../bills/services/bills.service';
import NotificationService from '../../communication/services/notification.service';
import { DiscoCode, MeterType, MeterValidationResult } from '../types/electricity.types';
import { ELECTRICITY_PROVIDERS, ElectricityProvider } from '../../bills/types/vtpass.types';

// Map DiscoCode to VTPass serviceID
const DISCO_TO_SERVICE: Record<DiscoCode, ElectricityProvider> = {
  EKEDC: 'eko-electric',
  IKEDC: 'ikeja-electric',
  JED: 'jos-electric',
  AEDC: 'abuja-electric',
  PHED: 'portharcourt-electric',
  EEDC: 'enugu-electric',
  KEDCO: 'kaduna-electric',
  BEDC: 'benin-electric',
  KAEDCO: 'kano-electric',
  IBEDC: 'ibadan-electric',
};

interface VendInput {
  userId: string;
  estateId?: string;
  meterNumber: string;
  disco: DiscoCode;
  meterType: MeterType;
  amount: number;
  smartMeterId?: string;
  autoLoaded?: boolean;
  useWallet?: boolean;
}

interface VendOutput {
  success: boolean;
  transaction: ElectricityTransactionRecord;
  error?: string;
}

class ElectricityService {
  // ─── Meter Registration ───

  async registerMeter(userId: string, estateId: string | null, data: {
    meterNumber: string; disco: DiscoCode; meterType: MeterType;
  }): Promise<SmartMeter> {
    const validation = await this.validateMeter(data.meterNumber, data.disco, data.meterType);
    if (!validation.valid) throw new Error('Meter validation failed. Please check the meter number and disco.');

    const existing = await SmartMeter.findOne({ where: { meter_number: data.meterNumber, disco: data.disco } });
    if (existing) throw new Error('This meter is already registered.');

    return SmartMeter.create({
      user_id: userId,
      estate_id: estateId,
      meter_number: data.meterNumber,
      disco: data.disco,
      meter_type: data.meterType,
      customer_name: validation.customerName || null,
      customer_address: validation.customerAddress || null,
      is_verified: true,
      auto_load_enabled: false,
    } as any);
  }

  async toggleAutoLoad(meterId: string, userId: string): Promise<SmartMeter> {
    const meter = await SmartMeter.findOne({ where: { id: meterId, user_id: userId } });
    if (!meter) throw new Error('Meter not found');
    if (!meter.is_verified) throw new Error('Meter must be verified before enabling auto-load');
    meter.auto_load_enabled = !meter.auto_load_enabled;
    await meter.save();
    return meter;
  }

  async getUserMeters(userId: string): Promise<SmartMeter[]> {
    return SmartMeter.findAll({ where: { user_id: userId }, order: [['created_at', 'DESC']] });
  }

  async deleteMeter(meterId: string, userId: string): Promise<void> {
    const meter = await SmartMeter.findOne({ where: { id: meterId, user_id: userId } });
    if (!meter) throw new Error('Meter not found');
    await meter.destroy();
  }

  // ─── Meter Validation ───

  async validateMeter(meterNumber: string, disco: DiscoCode, meterType: MeterType): Promise<MeterValidationResult> {
    const serviceID = DISCO_TO_SERVICE[disco];
    try {
      const result = await billsService.verifyMeter(serviceID, meterNumber, meterType);
      return {
        valid: true,
        customerName: result.customerName,
        customerAddress: result.address,
        meterNumber,
        disco,
      };
    } catch {
      return { valid: false, meterNumber, disco };
    }
  }

  // ─── Vend (delegates to billsService) ───

  async vend(input: VendInput): Promise<VendOutput> {
    const requestId = `LW_ELEC_${nanoid(12)}`;
    const serviceID = DISCO_TO_SERVICE[input.disco];

    let token: string | null = null;
    let provider = 'vtpass';
    let status: 'successful' | 'failed' | 'pending' = 'failed';
    let errorMsg: string | undefined;

    try {
      const result = await billsService.purchaseElectricity({
        userId: input.userId,
        estateId: input.estateId || '',
        serviceID,
        meterNumber: input.meterNumber,
        type: input.meterType,
        amount: input.amount,
        phone: '00000000000',
        useWallet: input.useWallet,
      });

      token = result.token || null;
      provider = result.provider || 'vtpass';
      status = result.status === 'success' ? 'successful' : result.status === 'pending' ? 'pending' : 'failed';
    } catch (err) {
      errorMsg = (err as Error).message;
    }

    const transaction = await ElectricityTransactionRecord.create({
      user_id: input.userId,
      estate_id: input.estateId || null,
      smart_meter_id: input.smartMeterId || null,
      meter_number: input.meterNumber,
      disco: input.disco,
      meter_type: input.meterType,
      amount: input.amount,
      token,
      units: null,
      status: status === 'successful' ? 'successful' : status === 'pending' ? 'requires_requery' : 'failed',
      provider,
      provider_reference: requestId,
      request_id: requestId,
      attempts: [{ provider, status: status === 'successful' ? 'success' : 'failed', attemptedAt: new Date() }],
      auto_loaded: input.autoLoaded || false,
      receipt_sent: false,
    } as any);

    if (status === 'successful') {
      this.sendReceipt(transaction).catch((e) => console.error('[electricity] receipt failed:', e.message));
      return { success: true, transaction };
    }

    return { success: false, transaction, error: errorMsg || 'Vend failed' };
  }

  // ─── Auto-load ───

  async autoLoadMeter(meterId: string, userId: string, amount: number): Promise<VendOutput> {
    const meter = await SmartMeter.findOne({ where: { id: meterId, user_id: userId } });
    if (!meter) throw new Error('Meter not found');
    if (!meter.is_verified) throw new Error('Meter is not verified');
    if (!meter.auto_load_enabled) throw new Error('Auto-load is not enabled for this meter');

    return this.vend({
      userId,
      estateId: meter.estate_id || undefined,
      meterNumber: meter.meter_number,
      disco: meter.disco as DiscoCode,
      meterType: meter.meter_type,
      amount,
      smartMeterId: meter.id,
      autoLoaded: true,
      useWallet: true,
    });
  }

  // ─── Requery ───

  async requery(requestId: string): Promise<{ status: string; token: string | null }> {
    const txn = await ElectricityTransactionRecord.findOne({ where: { request_id: requestId } });
    if (!txn) throw new Error('Transaction not found');

    // Bills service requery uses the bills transaction request_id, not ours
    // For now, return current status from our record
    return { status: txn.status, token: txn.token };
  }

  // ─── Transaction History ───

  async getUserTransactions(userId: string, limit = 20, offset = 0) {
    return ElectricityTransactionRecord.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }

  // ─── Private ───

  private async sendReceipt(transaction: ElectricityTransactionRecord): Promise<void> {
    const user = await User.findByPk(transaction.user_id);
    if (!user?.email) return;

    await NotificationService.sendNotification({
      type: 'email',
      to: user.email,
      template: 'electricityReceipt',
      data: {
        name: user.first_name,
        meter_number: transaction.meter_number,
        disco: transaction.disco,
        amount: Number(transaction.amount).toLocaleString('en-NG', { style: 'currency', currency: 'NGN' }),
        token: transaction.token || 'Pending',
        units: transaction.units || 'N/A',
        reference: transaction.request_id,
        date: transaction.createdAt.toLocaleDateString('en-NG'),
        provider: transaction.provider || 'N/A',
      },
      priority: 'high',
    });

    transaction.receipt_sent = true;
    await transaction.save();
  }
}

export const electricityService = new ElectricityService();
