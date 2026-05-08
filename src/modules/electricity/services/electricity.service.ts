import { nanoid } from 'nanoid';
import { providerRegistry } from '../providers';
import { SmartMeter } from '../models/smart-meter.model';
import { ElectricityTransactionRecord } from '../models/electricity-transaction.model';
import { User } from '../../auth/models/user.model';
import NotificationService from '../../communication/services/notification.service';
import {
  DiscoCode,
  MeterType,
  MeterValidationResult,
  VendResult,
  RequeryResult,
  ProviderAttempt,
  TransactionStatus,
} from '../types/electricity.types';

interface VendInput {
  userId: string;
  estateId?: string;
  meterNumber: string;
  disco: DiscoCode;
  meterType: MeterType;
  amount: number;
  smartMeterId?: string;
  autoLoaded?: boolean;
}

interface VendOutput {
  success: boolean;
  transaction: ElectricityTransactionRecord;
  error?: string;
}

class ElectricityService {
  // ─── Meter Registration ───

  async registerMeter(userId: string, estateId: string | null, data: {
    meterNumber: string;
    disco: DiscoCode;
    meterType: MeterType;
  }): Promise<SmartMeter> {
    // Validate meter with providers before saving
    const validation = await this.validateMeter(data.meterNumber, data.disco, data.meterType);
    if (!validation.valid) {
      throw new Error('Meter validation failed. Please check the meter number and disco.');
    }

    const existing = await SmartMeter.findOne({
      where: { meter_number: data.meterNumber, disco: data.disco },
    });
    if (existing) {
      throw new Error('This meter is already registered.');
    }

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
    const providers = providerRegistry.getAll();
    for (const provider of providers) {
      try {
        const result = await provider.validateMeter({ meterNumber, disco, meterType });
        if (result.valid) return result;
      } catch (err) {
        console.warn(`[electricity] ${provider.name} meter validation failed:`, (err as Error).message);
      }
    }
    return { valid: false, meterNumber, disco };
  }

  // ─── Vend with failover ───

  async vend(input: VendInput): Promise<VendOutput> {
    const requestId = `LW_ELEC_${nanoid(12)}`;
    const providers = providerRegistry.getAll();
    const attempts: ProviderAttempt[] = [];
    let vendResult: VendResult | null = null;

    for (const provider of providers) {
      const start = Date.now();
      try {
        vendResult = await provider.vend({
          meterNumber: input.meterNumber,
          disco: input.disco,
          meterType: input.meterType,
          amount: input.amount,
          requestId: `${requestId}_${provider.name}`,
        });
        attempts.push({
          provider: provider.name,
          status: 'success',
          reference: vendResult.reference,
          attemptedAt: new Date(),
          durationMs: Date.now() - start,
        });
        break;
      } catch (err) {
        const isTimeout = (err as any)?.code === 'ECONNABORTED';
        attempts.push({
          provider: provider.name,
          status: isTimeout ? 'timeout' : 'failed',
          error: (err as Error).message,
          attemptedAt: new Date(),
          durationMs: Date.now() - start,
        });
        console.warn(`[electricity] ${provider.name} vend failed:`, (err as Error).message);
      }
    }

    const status: TransactionStatus = vendResult ? 'successful' : 'failed';

    // Persist transaction
    const transaction = await ElectricityTransactionRecord.create({
      user_id: input.userId,
      estate_id: input.estateId || null,
      smart_meter_id: input.smartMeterId || null,
      meter_number: input.meterNumber,
      disco: input.disco,
      meter_type: input.meterType,
      amount: input.amount,
      token: vendResult?.token || null,
      units: vendResult?.units || null,
      status,
      provider: vendResult?.provider || null,
      provider_reference: vendResult?.reference || null,
      request_id: requestId,
      attempts,
      auto_loaded: input.autoLoaded || false,
      receipt_sent: false,
    } as any);

    if (!vendResult) {
      return { success: false, transaction, error: 'All providers failed' };
    }

    // Send receipt email asynchronously (queued via notification service)
    this.sendReceipt(transaction).catch((err) =>
      console.error('[electricity] receipt send failed:', err.message)
    );

    return { success: true, transaction };
  }

  // ─── Auto-load: vend using registered smart meter ───

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
    });
  }

  // ─── Requery ───

  async requery(requestId: string, providerName?: string): Promise<RequeryResult> {
    if (providerName) {
      const provider = providerRegistry.getByName(providerName);
      if (provider) {
        try {
          const result = await provider.requery(requestId);
          if (result.status !== 'pending') {
            await this.updateTransactionFromRequery(requestId, result);
            return result;
          }
        } catch (err) {
          console.warn(`[electricity] ${providerName} requery failed:`, (err as Error).message);
        }
      }
    }

    for (const provider of providerRegistry.getAll()) {
      if (provider.name === providerName) continue;
      try {
        const result = await provider.requery(requestId);
        if (result.status !== 'pending') {
          await this.updateTransactionFromRequery(requestId, result);
          return result;
        }
      } catch { continue; }
    }

    return { status: 'pending', reference: requestId };
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

  // ─── Private helpers ───

  private async updateTransactionFromRequery(requestId: string, result: RequeryResult): Promise<void> {
    const txn = await ElectricityTransactionRecord.findOne({ where: { request_id: requestId } });
    if (!txn) return;

    txn.status = result.status === 'successful' ? 'successful' : 'failed';
    if (result.token) txn.token = result.token;
    if (result.units) txn.units = result.units;
    await txn.save();

    if (result.status === 'successful' && !txn.receipt_sent) {
      this.sendReceipt(txn).catch((err) =>
        console.error('[electricity] receipt send failed:', err.message)
      );
    }
  }

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
