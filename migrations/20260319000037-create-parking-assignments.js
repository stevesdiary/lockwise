'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('parking_assignments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      slot_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
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
      vehicle_plate: { type: Sequelize.STRING(20), allowNull: true },
      vehicle_model: { type: Sequelize.STRING(50), allowNull: true },
      assigned_date: { type: Sequelize.DATEONLY, allowNull: false, defaultValue: Sequelize.NOW },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('parking_assignments', ['user_id']);
    await queryInterface.addIndex('parking_assignments', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('parking_assignments');
  },
};
