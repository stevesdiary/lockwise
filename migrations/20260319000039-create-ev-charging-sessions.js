'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('ev_charging_sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      slot_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'parking_slots', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      start_time: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      end_time: { type: Sequelize.DATE, allowNull: true },
      energy_consumed: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      rate_per_kwh: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 50.00 },
      total_cost: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      payment_status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'pending' },
      payment_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'payments', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('ev_charging_sessions', ['slot_id']);
    await queryInterface.addIndex('ev_charging_sessions', ['user_id']);
    await queryInterface.addIndex('ev_charging_sessions', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('ev_charging_sessions');
  },
};
