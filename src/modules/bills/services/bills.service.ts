import vtpassService from './vtpass.service';
import walletService from '../../wallet/services/wallet.service';
import { kudaService } from '../../kuda/services/kuda.service';
import { BillTransaction } from '../models/bill-transaction.model';
import {
  ElectricityProvider, ELECTRICITY_PROVIDERS,
  AirtimeProvider, AIRTIME_PROVIDERS,
  DataProvider, DATA_PROVIDERS,
  TVProvider, TV_PROVIDERS,
} from '../types/vtpass.types';

const ALL_PROVIDERS: Record<string, string> = {
  ...ELECTRICITY_PROVIDERS,
  ...AIRTIME_PROVIDERS,
  ...DATA_PROVIDERS,
  ...TV_PROVIDERS,
};

class BillsService {
  // ─── Electricity ────────────────────────────────────────────────────────────

  async verifyMeter(serviceID: ElectricityProvider, meterNumber: string, type: 'prepaid' | 'postpaid') {
    const result = await vtpassService.verifyMeter({ billersCode: meterNumber, serviceID, type });

    if (result.code !== '000') throw new Error(result.content?.toString() || 'Meter verification failed');
    if (result.content?.WrongBillersCode || result.content?.error) {
      throw new Error(result.content.error || 'Invalid meter number');
    }

    return {
      customerName: result.content.Customer_Name,
      meterNumber: result.content.Meter_Number,
      address: result.content.Address,
      district: result.content.Customer_District,
    };
  }

  async purchaseElectricity(params: {
    userId: string; estateId: string; serviceID: ElectricityProvider;
    meterNumber: string; type: 'prepaid' | 'postpaid'; amount: number; phone: string;
    useWallet?: boolean; provider?: 'vtpass' | 'kuda';
  }) {
    if (params.useWallet) {
      await walletService.debit(params.userId, params.amount, `Electricity: ${ELECTRICITY_PROVIDERS[params.serviceID]}`, 'bill_payment');
    }
    return this.executePurchase({
      userId: params.userId, estateId: params.estateId,
      serviceID: params.serviceID, billersCode: params.meterNumber,
      variationCode: params.type, amount: params.amount, phone: params.phone,
      provider: params.provider,
    });
  }

  // ─── Airtime ────────────────────────────────────────────────────────────────

  async purchaseAirtime(params: {
    userId: string; estateId: string; serviceID: AirtimeProvider;
    phone: string; amount: number; useWallet?: boolean; provider?: 'vtpass' | 'kuda';
  }) {
    if (params.useWallet) {
      await walletService.debit(params.userId, params.amount, `Airtime: ${AIRTIME_PROVIDERS[params.serviceID]}`, 'bill_payment');
    }
    return this.executePurchase({
      userId: params.userId, estateId: params.estateId,
      serviceID: params.serviceID, billersCode: params.phone,
      variationCode: 'default', amount: params.amount, phone: params.phone,
      provider: params.provider,
    });
  }

  // ─── Data ───────────────────────────────────────────────────────────────────

  async getDataPlans(serviceID: DataProvider) {
    const result = await vtpassService.getVariations(serviceID);
    return result.content?.vapirations || result.content?.variations || [];
  }

  async purchaseData(params: {
    userId: string; estateId: string; serviceID: DataProvider;
    phone: string; variationCode: string; amount: number; useWallet?: boolean; provider?: 'vtpass' | 'kuda';
  }) {
    if (params.useWallet) {
      await walletService.debit(params.userId, params.amount, `Data: ${DATA_PROVIDERS[params.serviceID]}`, 'bill_payment');
    }
    return this.executePurchase({
      userId: params.userId, estateId: params.estateId,
      serviceID: params.serviceID, billersCode: params.phone,
      variationCode: params.variationCode, amount: params.amount, phone: params.phone,
      provider: params.provider,
    });
  }

  // ─── TV ─────────────────────────────────────────────────────────────────────

  async verifySmartcard(serviceID: TVProvider, smartcardNumber: string) {
    const result = await vtpassService.verifyMeter({ billersCode: smartcardNumber, serviceID });
    if (result.code !== '000') throw new Error(result.content?.toString() || 'Smartcard verification failed');
    return {
      customerName: result.content.Customer_Name,
      currentBouquet: result.content.Current_Bouquet,
      dueDate: result.content.Due_Date,
      renewalAmount: result.content.Renewal_Amount,
    };
  }

  async getTVPlans(serviceID: TVProvider) {
    const result = await vtpassService.getVariations(serviceID);
    return result.content?.vapirations || result.content?.variations || [];
  }

  async purchaseTV(params: {
    userId: string; estateId: string; serviceID: TVProvider;
    smartcardNumber: string; variationCode: string; amount: number;
    phone: string; subscriptionType?: string; useWallet?: boolean; provider?: 'vtpass' | 'kuda';
  }) {
    if (params.useWallet) {
      await walletService.debit(params.userId, params.amount, `TV: ${TV_PROVIDERS[params.serviceID]}`, 'bill_payment');
    }
    return this.executePurchase({
      userId: params.userId, estateId: params.estateId,
      serviceID: params.serviceID, billersCode: params.smartcardNumber,
      variationCode: params.variationCode, amount: params.amount, phone: params.phone,
      subscriptionType: params.subscriptionType, provider: params.provider,
    });
  }

  // ─── Shared ─────────────────────────────────────────────────────────────────

  private async executePurchase(params: {
    userId: string; estateId: string; serviceID: string;
    billersCode: string; variationCode: string; amount: number;
    phone: string; subscriptionType?: string; provider?: 'vtpass' | 'kuda';
  }) {
    const useKuda = params.provider === 'kuda';
    const requestId = vtpassService.generateRequestId();
    const providerName = ALL_PROVIDERS[params.serviceID] || params.serviceID;

    const transaction = await BillTransaction.create({
      request_id: requestId,
      user_id: params.userId,
      estate_id: params.estateId,
      service_id: params.serviceID,
      provider_name: providerName,
      provider: useKuda ? 'kuda' : 'vtpass',
      billers_code: params.billersCode,
      variation_code: params.variationCode,
      amount: params.amount,
      phone: params.phone,
      status: 'pending',
    });

    try {
      // Primary: VTPass (unless explicitly requesting Kuda)
      if (!useKuda) {
        try {
          return await this.executeViaVTPass(transaction, params, requestId, providerName);
        } catch (vtpassError: any) {
          // Fallback to Kuda on VTPass failure
          console.warn(`[bills] VTPass failed, falling back to Kuda: ${vtpassError.message}`);
          return await this.executeViaKuda(transaction, params, requestId, providerName);
        }
      }

      // Explicit Kuda request
      return await this.executeViaKuda(transaction, params, requestId, providerName);
    } catch (error: any) {
      await transaction.update({ status: 'failed', response_description: error.message });
      throw error;
    }
  }

  async requeryTransaction(requestId: string, userId: string) {
    const transaction = await BillTransaction.findOne({ where: { request_id: requestId, user_id: userId } });
    if (!transaction) throw new Error('Transaction not found');

    const result = await vtpassService.requeryTransaction(requestId);
    const txStatus = result.content?.transactions?.status;
    const isSuccess = result.code === '000' && txStatus === 'delivered';

    await transaction.update({
      status: isSuccess ? 'success' : txStatus === 'initiated' ? 'pending' : 'failed',
      token: result.purchased_code || transaction.token,
      response_code: result.code,
      response_description: result.response_description,
    });

    return { requestId, status: transaction.status, token: transaction.token, amount: transaction.amount, provider: transaction.provider_name };
  }

  async handleWebhook(payload: any) {
    const { request_id, status, purchased_code, transactionId } = payload.data || {};
    if (!request_id) return;
    const transaction = await BillTransaction.findOne({ where: { request_id } });
    if (!transaction) return;
    await transaction.update({
      status: status === 'delivered' ? 'success' : status === 'initiated' ? 'pending' : 'failed',
      token: purchased_code || transaction.token,
      vtpass_transaction_id: transactionId || transaction.vtpass_transaction_id,
    });
  }

  async getUserTransactions(userId: string, limit = 20, offset = 0) {
    return BillTransaction.findAndCountAll({ where: { user_id: userId }, order: [['created_at', 'DESC']], limit, offset });
  }

  getProviders() {
    return {
      electricity: Object.entries(ELECTRICITY_PROVIDERS).map(([id, name]) => ({ id, name })),
      airtime: Object.entries(AIRTIME_PROVIDERS).map(([id, name]) => ({ id, name })),
      data: Object.entries(DATA_PROVIDERS).map(([id, name]) => ({ id, name })),
      tv: Object.entries(TV_PROVIDERS).map(([id, name]) => ({ id, name })),
    };
  }

  private async executeViaVTPass(transaction: any, params: any, requestId: string, providerName: string) {
    const result = await vtpassService.purchase({
      request_id: requestId,
      serviceID: params.serviceID,
      billersCode: params.billersCode,
      variation_code: params.variationCode,
      amount: params.amount,
      phone: params.phone,
      subscription_type: params.subscriptionType,
    });

    const txStatus = result.content?.transactions?.status;
    const isSuccess = result.code === '000' && txStatus === 'delivered';
    const isPending = txStatus === 'initiated';

    await transaction.update({
      status: isSuccess ? 'success' : isPending ? 'pending' : 'failed',
      token: result.purchased_code || null,
      vtpass_transaction_id: result.content?.transactions?.transactionId || null,
      response_code: result.code,
      response_description: result.response_description,
      provider: 'vtpass',
    });

    if (!isSuccess && !isPending) throw new Error(result.response_description || 'VTPass purchase failed');

    return {
      requestId,
      status: transaction.status,
      token: result.purchased_code || null,
      amount: params.amount,
      provider: providerName,
      transactionId: result.content?.transactions?.transactionId,
      message: result.response_description,
    };
  }

  private async executeViaKuda(transaction: any, params: any, requestId: string, providerName: string) {
    const result = await kudaService.billPayment({
      amount: params.amount,
      serviceType: params.serviceID,
      customerId: params.billersCode,
      narration: providerName,
      trackingReference: requestId,
    });

    await transaction.update({
      status: result.status === 'success' ? 'success' : 'failed',
      response_description: result.message,
      provider: 'kuda',
    });

    if (result.status !== 'success') throw new Error(result.message || 'Kuda bill payment failed');

    return {
      requestId,
      status: result.status,
      token: null,
      amount: params.amount,
      provider: 'kuda',
      transactionId: result.reference,
      message: result.message,
    };
  }
}

export default new BillsService();
