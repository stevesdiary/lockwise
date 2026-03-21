'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('guest_parking', {
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
      owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      guest_name: { type: Sequelize.STRING(100), allowNull: false },
      guest_phone: { type: Sequelize.STRING(20), allowNull: true },
      guest_vehicle_plate: { type: Sequelize.STRING(20), allowNull: true },
      start_time: { type: Sequelize.DATE, allowNull: false },
      end_time: { type: Sequelize.DATE, allowNull: false },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'active' },
      access_code: { type: Sequelize.STRING(10), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('guest_parking', ['slot_id']);
    await queryInterface.addIndex('guest_parking', ['owner_id']);
    await queryInterface.addIndex('guest_parking', ['start_time', 'end_time']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('guest_parking');
  },
};
