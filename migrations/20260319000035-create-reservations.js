'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('reservations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      amenity_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'amenities', key: 'id' },
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
      start_time: { type: Sequelize.DATE, allowNull: false },
      end_time: { type: Sequelize.DATE, allowNull: false },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'pending' },
      guests_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
      total_amount: { type: Sequelize.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
      payment_status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'unpaid' },
      notes: { type: Sequelize.TEXT, allowNull: true },
      cancelled_reason: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('reservations', ['amenity_id']);
    await queryInterface.addIndex('reservations', ['user_id']);
    await queryInterface.addIndex('reservations', ['status']);
    await queryInterface.addIndex('reservations', ['start_time', 'end_time']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('reservations');
  },
};
