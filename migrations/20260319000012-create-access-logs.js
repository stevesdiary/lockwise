'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('access_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'estates', key: 'estate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('active', 'used', 'approved', 'rejected', 'expired', 'revoked'),
        allowNull: false,
        defaultValue: 'active',
      },
      access_code: { type: Sequelize.STRING, allowNull: true },
      valid_from: { type: Sequelize.DATE, allowNull: true },
      valid_until: { type: Sequelize.DATE, allowNull: true },
      guest_name: { type: Sequelize.STRING, allowNull: true },
      guest_phone: { type: Sequelize.STRING, allowNull: true },
      entry_time: { type: Sequelize.DATE, allowNull: true },
      exit_time: { type: Sequelize.DATE, allowNull: true },
      scanned_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      remark: { type: Sequelize.TEXT, allowNull: true },
      approved_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      // Gate/unit fields (used by access validation logic)
      gate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'gates', key: 'gate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      unit_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'units', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      entry_gate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'gates', key: 'gate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      exit_gate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'gates', key: 'gate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      verification_method: {
        type: Sequelize.ENUM('rfid', 'qr_code', 'access_code', 'biometric', 'manual'),
        allowNull: true,
      },
      visitor_details: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('access_logs', ['user_id']);
    await queryInterface.addIndex('access_logs', ['estate_id']);
    await queryInterface.addIndex('access_logs', ['status']);
    await queryInterface.addIndex('access_logs', ['access_code']);
    await queryInterface.addIndex('access_logs', ['valid_from', 'valid_until']);
    await queryInterface.addIndex('access_logs', ['gate_id']);
    await queryInterface.addIndex('access_logs', ['entry_gate_id']);
    await queryInterface.addIndex('access_logs', ['exit_gate_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('access_logs');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_access_logs_status"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_access_logs_verification_method"');
  },
};
