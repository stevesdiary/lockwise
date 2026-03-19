'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('parking_slots', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'estates', key: 'estate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      slot_number: { type: Sequelize.STRING(20), allowNull: false },
      slot_type: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'regular' },
      location: { type: Sequelize.STRING(100), allowNull: true },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'available' },
      has_ev_charger: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      charger_type: { type: Sequelize.STRING(20), allowNull: true },
      charger_power: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('parking_slots', ['estate_id']);
    await queryInterface.addIndex('parking_slots', ['status']);
    await queryInterface.addIndex('parking_slots', ['estate_id', 'slot_number'], { unique: true });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('parking_slots');
  },
};
