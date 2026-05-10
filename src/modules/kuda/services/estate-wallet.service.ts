import { EstateWallet, EstateWalletTransaction } from '../models/estate-wallet.model';
import { kudaService } from './kuda.service';
import { InsufficientBalanceError } from '../types/kuda.types';
import sequelize from '../../../shared/core/database';
import { nanoid } from 'nanoid';

class EstateWalletService {
  async getOrCreate(estateId: string): Promise<EstateWallet> {
    const [wallet] = await EstateWallet.findOrCreate({
      where: { estate_id: estateId },
      defaults: { estate_id: estateId, balance: 0, currency: 'NGN', is_active: true },
    });
    return wallet;
  }

  async getBalance(estateId: string) {
    const wallet = await this.getOrCreate(estateId);
    return { balance: Number(wallet.balance), currency: wallet.currency };
  }

  async provisionKudaAccount(estateId: string): Promise<EstateWallet> {
    const wallet = await this.getOrCreate(estateId);
    if (wallet.kuda_account_number) return wallet;

    const trackingReference = `EW_${nanoid(12)}`;
    const result = await kudaService.createVirtualAccount({
      firstName: 'Estate',
      lastName: estateId.slice(0, 8),
      email: `estate-${estateId.slice(0, 8)}@lockwise.internal`,
      trackingReference,
    });

    await wallet.update({
      kuda_account_number: result.accountNumber,
      kuda_account_name: result.accountName,
      kuda_tracking_reference: trackingReference,
    });

    return wallet.reload();
  }

  async credit(estateId: string, amount: number, description: string, reference?: string): Promise<EstateWalletTransaction> {
    return sequelize.transaction(async (t) => {
      const wallet = await EstateWallet.findOne({ where: { estate_id: estateId }, lock: t.LOCK.UPDATE, transaction: t });
      if (!wallet) throw new Error('Estate wallet not found');
      if (!wallet.is_active) throw new Error('Estate wallet is inactive');

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + amount;

      await wallet.update({ balance: balanceAfter }, { transaction: t });

      return EstateWalletTransaction.create({
        estate_wallet_id: wallet.id,
        estate_id: estateId,
        type: 'credit',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
        category: 'funding',
        reference: reference ?? null,
        status: 'success',
      }, { transaction: t });
    });
  }

  async debit(estateId: string, amount: number, description: string, category: string = 'subscription', reference?: string): Promise<EstateWalletTransaction> {
    return sequelize.transaction(async (t) => {
      const wallet = await EstateWallet.findOne({ where: { estate_id: estateId }, lock: t.LOCK.UPDATE, transaction: t });
      if (!wallet) throw new Error('Estate wallet not found');
      if (!wallet.is_active) throw new Error('Estate wallet is inactive');

      const balanceBefore = Number(wallet.balance);
      if (balanceBefore < amount) throw new InsufficientBalanceError(balanceBefore, amount);

      const balanceAfter = balanceBefore - amount;

      await wallet.update({ balance: balanceAfter }, { transaction: t });

      return EstateWalletTransaction.create({
        estate_wallet_id: wallet.id,
        estate_id: estateId,
        type: 'debit',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
        category,
        reference: reference ?? null,
        status: 'success',
      }, { transaction: t });
    });
  }

  async getTransactions(estateId: string, limit = 20, offset = 0) {
    const wallet = await this.getOrCreate(estateId);
    return EstateWalletTransaction.findAndCountAll({
      where: { estate_wallet_id: wallet.id },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }
}

export const estateWalletService = new EstateWalletService();
export default estateWalletService;
