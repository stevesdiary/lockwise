import { Op } from 'sequelize';
import { nanoid } from 'nanoid';
import sequelize from '../../../shared/core/database';
import { EstateFee, EstateInvoice, EstateWithdrawal } from '../models/collections.model';
import { User } from '../../auth/models/user.model';
import walletService from '../../wallet/services/wallet.service';
import { estateWalletService } from '../../kuda/services/estate-wallet.service';
import NotificationService from '../../communication/services/notification.service';
import logger from '../../../shared/utils/logger';

class CollectionsService {
  // ─── Fee CRUD ───

  async createFee(estateId: string, createdBy: string, data: {
    name: string; description?: string; amount: number; frequency: string;
    due_day?: number; is_mandatory?: boolean; grace_period_days?: number; penalty_amount?: number;
  }) {
    const fee = await EstateFee.create({
      estate_id: estateId,
      created_by: createdBy,
      name: data.name,
      description: data.description || null,
      amount: data.amount,
      frequency: data.frequency,
      due_day: data.due_day ?? 1,
      is_mandatory: data.is_mandatory ?? true,
      grace_period_days: data.grace_period_days ?? 7,
      penalty_amount: data.penalty_amount ?? 0,
    } as any);

    let invoicesCreated = 0;
    try {
      invoicesCreated = await this.generateInvoices(estateId, fee.id);
    } catch (error) {
      logger.error('[collections] Failed to generate invoices for new fee:', error);
    }

    return { fee, invoices_created: invoicesCreated };
  }

  async updateFee(feeId: string, estateId: string, data: Partial<{
    name: string; description: string; amount: number; frequency: string;
    due_day: number; is_mandatory: boolean; grace_period_days: number; penalty_amount: number; is_active: boolean;
  }>) {
    const fee = await EstateFee.findOne({ where: { id: feeId, estate_id: estateId } });
    if (!fee) throw new Error('Fee not found');
    await fee.update(data);
    return fee;
  }

  async deleteFee(feeId: string, estateId: string) {
    const fee = await EstateFee.findOne({ where: { id: feeId, estate_id: estateId } });
    if (!fee) throw new Error('Fee not found');
    await fee.update({ is_active: false });
  }

  async getEstateFees(estateId: string) {
    return EstateFee.findAll({ where: { estate_id: estateId, is_active: true }, order: [['created_at', 'ASC']] });
  }

  // ─── Invoice Generation ───

  async generateInvoices(estateId: string, feeId: string, billingPeriod?: string): Promise<number> {
    const fee = await EstateFee.findOne({ where: { id: feeId, estate_id: estateId, is_active: true } });
    if (!fee) throw new Error('Fee not found or inactive');

    const residents = await User.findAll({ where: { estate_id: estateId, status: 'active', user_type: 'resident' } });

    const now = new Date();
    const dueDate = new Date(now.getFullYear(), now.getMonth(), fee.due_day);
    if (dueDate < now) dueDate.setMonth(dueDate.getMonth() + 1);

    const period = billingPeriod || `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;

    let created = 0;
    for (const resident of residents) {
      const [, wasCreated] = await EstateInvoice.findOrCreate({
        where: { estate_id: estateId, fee_id: feeId, user_id: resident.id, billing_period: period },
        defaults: {
          estate_id: estateId,
          fee_id: feeId,
          user_id: resident.id,
          amount: fee.amount,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'pending',
          billing_period: period,
        } as any,
      });
      if (wasCreated) created++;
    }
    return created;
  }

  // ─── Payment (atomic ledger transfer) ───

  async payInvoice(invoiceId: string, userId: string): Promise<EstateInvoice> {
    const invoice = await EstateInvoice.findOne({ where: { id: invoiceId, user_id: userId } });
    if (!invoice) throw new Error('Invoice not found');
    if (invoice.status === 'paid') throw new Error('Invoice already paid');
    if (invoice.status === 'waived') throw new Error('Invoice has been waived');

    const totalAmount = Number(invoice.amount) + Number(invoice.penalty_applied);
    const reference = `dues_${nanoid(12)}`;

    await sequelize.transaction(async (t) => {
      // Debit resident wallet
      const residentWallet = await walletService.getOrCreateWallet(userId);
      const residentBalance = Number(residentWallet.balance);
      if (residentBalance < totalAmount) throw new Error('Insufficient wallet balance');

      await walletService.debit(userId, totalAmount, `Estate dues: ${invoice.billing_period}`, 'estate_dues', reference);

      // Credit estate wallet
      const user = await User.findByPk(userId);
      const desc = `Dues from ${user?.first_name || 'Resident'} ${user?.last_name || ''} - ${invoice.billing_period}`;
      await estateWalletService.credit(invoice.estate_id, totalAmount, desc, reference);

      // Mark invoice paid
      await invoice.update({ status: 'paid', paid_at: new Date(), payment_reference: reference }, { transaction: t });
    });

    // Send receipt async
    this.sendReceipt(invoice, userId).catch((e) => console.error('[collections] receipt failed:', e.message));

    return invoice.reload();
  }

  async waiveInvoice(invoiceId: string, estateId: string): Promise<EstateInvoice> {
    const invoice = await EstateInvoice.findOne({ where: { id: invoiceId, estate_id: estateId } });
    if (!invoice) throw new Error('Invoice not found');
    if (invoice.status === 'paid') throw new Error('Cannot waive a paid invoice');
    await invoice.update({ status: 'waived' });
    return invoice;
  }

  // ─── Queries ───

  async getResidentInvoices(userId: string, status?: string, limit = 20, offset = 0) {
    const where: any = { user_id: userId };
    if (status) where.status = status;
    return EstateInvoice.findAndCountAll({
      where,
      include: [{ model: EstateFee, attributes: ['name', 'frequency'] }],
      order: [['due_date', 'DESC']],
      limit,
      offset,
    });
  }

  async getEstateCollectionSummary(estateId: string) {
    const [totalDue, totalPaid, totalOverdue] = await Promise.all([
      EstateInvoice.sum('amount', { where: { estate_id: estateId, status: 'pending' } }),
      EstateInvoice.sum('amount', { where: { estate_id: estateId, status: 'paid' } }),
      EstateInvoice.sum('amount', { where: { estate_id: estateId, status: 'overdue' } }),
    ]);
    const pendingCount = await EstateInvoice.count({ where: { estate_id: estateId, status: 'pending' } });
    const overdueCount = await EstateInvoice.count({ where: { estate_id: estateId, status: 'overdue' } });

    return { total_due: totalDue || 0, total_paid: totalPaid || 0, total_overdue: totalOverdue || 0, pending_count: pendingCount, overdue_count: overdueCount };
  }

  async getResidentStatus(estateId: string, residentId: string) {
    return EstateInvoice.findAll({
      where: { estate_id: estateId, user_id: residentId },
      include: [{ model: EstateFee, attributes: ['name', 'frequency'] }],
      order: [['due_date', 'DESC']],
    });
  }

  // ─── Overdue + Penalty (called by cron) ───

  async markOverdueInvoices(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    const [count] = await EstateInvoice.update(
      { status: 'overdue' },
      { where: { status: 'pending', due_date: { [Op.lt]: today } } },
    );
    return count;
  }

  async applyPenalties(): Promise<number> {
    const overdueInvoices = await EstateInvoice.findAll({
      where: { status: 'overdue', penalty_applied: 0 },
      include: [{ model: EstateFee, attributes: ['penalty_amount', 'grace_period_days'] }],
    });

    let applied = 0;
    const today = new Date();
    for (const inv of overdueInvoices) {
      const fee = inv.fee;
      if (!fee || Number(fee.penalty_amount) === 0) continue;
      const dueDate = new Date(inv.due_date);
      const graceEnd = new Date(dueDate);
      graceEnd.setDate(graceEnd.getDate() + fee.grace_period_days);
      if (today > graceEnd) {
        await inv.update({ penalty_applied: fee.penalty_amount });
        applied++;
      }
    }
    return applied;
  }

  // ─── Withdrawal ───

  async requestWithdrawal(estateId: string, requestedBy: string, data: {
    amount: number; bank_code: string; account_number: string; account_name: string;
  }): Promise<EstateWithdrawal> {
    const balance = await estateWalletService.getBalance(estateId);
    if (balance.balance < data.amount) throw new Error('Insufficient estate wallet balance');

    const reference = `wd_${nanoid(12)}`;

    // Debit estate wallet first
    await estateWalletService.debit(estateId, data.amount, `Withdrawal to ${data.account_name}`, 'withdrawal', reference);

    // Create withdrawal record (actual bank transfer handled separately or via Kuda)
    return EstateWithdrawal.create({
      estate_id: estateId,
      amount: data.amount,
      bank_code: data.bank_code,
      account_number: data.account_number,
      account_name: data.account_name,
      status: 'pending',
      transfer_reference: reference,
      requested_by: requestedBy,
    } as any);
  }

  async getWithdrawals(estateId: string, limit = 20, offset = 0) {
    return EstateWithdrawal.findAndCountAll({
      where: { estate_id: estateId },
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }

  // ─── Private ───

  private async sendReceipt(invoice: EstateInvoice, userId: string) {
    const user = await User.findByPk(userId);
    if (!user?.email) return;
    const fee = await EstateFee.findByPk(invoice.fee_id);

    await NotificationService.sendNotification({
      type: 'email',
      to: user.email,
      template: 'estateDuesReceipt',
      data: {
        name: user.first_name,
        fee_name: fee?.name || 'Estate Dues',
        amount: Number(invoice.amount) + Number(invoice.penalty_applied),
        billing_period: invoice.billing_period,
        reference: invoice.payment_reference,
        date: new Date().toLocaleDateString('en-NG'),
      },
      priority: 'high',
    });
  }
}

export const collectionsService = new CollectionsService();
