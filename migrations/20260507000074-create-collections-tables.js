'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Update estate_wallet_transactions category enum (if table exists)
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_estate_wallet_transactions_category"
        ADD VALUE IF NOT EXISTS 'dues_collection';
      `);
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_estate_wallet_transactions_category"
        ADD VALUE IF NOT EXISTS 'withdrawal';
      `);
    } catch (e) {
      // Enum may not exist yet if estate_wallets migration hasn't run
    }

    // Update wallet_transactions category enum (if table exists)
    try {
      await queryInterface.sequelize.query(`
        ALTER TYPE "enum_wallet_transactions_category"
        ADD VALUE IF NOT EXISTS 'estate_dues';
      `);
    } catch (e) {
      // Enum may not exist yet if wallets migration hasn't run
    }

    await queryInterface.createTable('estate_fees', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      estate_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'estates', key: 'estate_id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      frequency: { type: Sequelize.ENUM('monthly', 'quarterly', 'annually', 'one_time'), allowNull: false },
      due_day: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      is_mandatory: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      grace_period_days: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 7 },
      penalty_amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      created_by: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('estate_fees', ['estate_id', 'is_active']);

    await queryInterface.createTable('estate_invoices', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      estate_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'estates', key: 'estate_id' }, onDelete: 'CASCADE' },
      fee_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'estate_fees', key: 'id' }, onDelete: 'CASCADE' },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      penalty_applied: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      due_date: { type: Sequelize.DATEONLY, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'paid', 'overdue', 'waived'), allowNull: false, defaultValue: 'pending' },
      paid_at: { type: Sequelize.DATE, allowNull: true },
      payment_reference: { type: Sequelize.STRING, allowNull: true },
      billing_period: { type: Sequelize.STRING, allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('estate_invoices', ['estate_id', 'fee_id', 'user_id', 'billing_period'], { unique: true, name: 'unique_invoice_per_period' });
    await queryInterface.addIndex('estate_invoices', ['user_id', 'status']);
    await queryInterface.addIndex('estate_invoices', ['due_date', 'status']);

    await queryInterface.createTable('estate_withdrawals', {
      id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
      estate_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'estates', key: 'estate_id' }, onDelete: 'CASCADE' },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      bank_code: { type: Sequelize.STRING, allowNull: false },
      account_number: { type: Sequelize.STRING, allowNull: false },
      account_name: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'), allowNull: false, defaultValue: 'pending' },
      transfer_reference: { type: Sequelize.STRING, allowNull: true },
      failure_reason: { type: Sequelize.STRING, allowNull: true },
      requested_by: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' } },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });

    await queryInterface.addIndex('estate_withdrawals', ['estate_id', 'status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('estate_withdrawals');
    await queryInterface.dropTable('estate_invoices');
    await queryInterface.dropTable('estate_fees');
  },
};
