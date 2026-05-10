import { Wallet, WalletTransaction } from '../models/wallet.model';
import sequelize from '../../../shared/core/database';
import { kudaService } from '../../kuda/services/kuda.service';
import { nanoid } from 'nanoid';

class WalletService {
  /** Get or create wallet for a user */
  async getOrCreateWallet(userId: string): Promise<Wallet> {
    const [wallet] = await Wallet.findOrCreate({
      where: { user_id: userId },
      defaults: { user_id: userId, balance: 0, currency: 'NGN', is_active: true },
    });
    return wallet;
  }

  /** Lazy-provision Kuda virtual account for a resident wallet */
  async provisionKudaAccount(userId: string): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId);
    if (wallet.kuda_account_number) return wallet;

    const trackingReference = `RW_${nanoid(12)}`;
    const result = await kudaService.createVirtualAccount({
      firstName: 'Resident',
      lastName: userId.slice(0, 8),
      email: `resident-${userId.slice(0, 8)}@lockwise.internal`,
      trackingReference,
    });

    await wallet.update({
      kuda_account_number: result.accountNumber,
      kuda_account_name: result.accountName,
      kuda_tracking_reference: trackingReference,
    });

    return wallet.reload();
  }

  /** Get wallet with Kuda account info */
  async getWalletWithAccount(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: Number(wallet.balance),
      currency: wallet.currency,
      kuda_account_number: wallet.kuda_account_number,
      kuda_account_name: wallet.kuda_account_name,
    };
  }

  /** Get wallet balance */
  async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return { balance: Number(wallet.balance), currency: wallet.currency };
  }

  /** Credit wallet (funding via Paystack) */
  async credit(userId: string, amount: number, description: string, reference?: string): Promise<WalletTransaction> {
    return sequelize.transaction(async (t) => {
      const wallet = await Wallet.findOne({ where: { user_id: userId }, lock: t.LOCK.UPDATE, transaction: t });
      if (!wallet) throw new Error('Wallet not found');
      if (!wallet.is_active) throw new Error('Wallet is inactive');

      const balanceBefore = Number(wallet.balance);
      const balanceAfter = balanceBefore + amount;

      await wallet.update({ balance: balanceAfter }, { transaction: t });

      return WalletTransaction.create({
        wallet_id: wallet.id,
        user_id: userId,
        type: 'credit',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
        category: 'funding',
        reference,
        status: 'success',
      }, { transaction: t });
    });
  }

  /** Debit wallet (bill payment) */
  async debit(userId: string, amount: number, description: string, category: string = 'bill_payment', reference?: string): Promise<WalletTransaction> {
    return sequelize.transaction(async (t) => {
      const wallet = await Wallet.findOne({ where: { user_id: userId }, lock: t.LOCK.UPDATE, transaction: t });
      if (!wallet) throw new Error('Wallet not found');
      if (!wallet.is_active) throw new Error('Wallet is inactive');

      const balanceBefore = Number(wallet.balance);
      if (balanceBefore < amount) throw new Error('Insufficient balance');

      const balanceAfter = balanceBefore - amount;

      await wallet.update({ balance: balanceAfter }, { transaction: t });

      return WalletTransaction.create({
        wallet_id: wallet.id,
        user_id: userId,
        type: 'debit',
        amount,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        description,
        category,
        reference,
        status: 'success',
      }, { transaction: t });
    });
  }

  /** Refund a failed transaction */
  async refund(userId: string, amount: number, reference: string): Promise<WalletTransaction> {
    return this.credit(userId, amount, `Refund for ${reference}`, `refund_${reference}`);
  }

  /** Get transaction history */
  async getTransactions(userId: string, limit = 20, offset = 0) {
    return WalletTransaction.findAndCountAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }
}

export default new WalletService();
