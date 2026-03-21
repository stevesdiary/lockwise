'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('residents', {
      resident_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: { type: Sequelize.STRING, allowNull: true },
      subscribed: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
      address: { type: Sequelize.TEXT, allowNull: true },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'estates', key: 'estate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      unit_id: {
        type: Sequelize.UUID,
        allowNull: true, // nullable per 20260222000001
        references: { model: 'units', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('residents', ['estate_id']);
    await queryInterface.addIndex('residents', ['user_id']);
    await queryInterface.addIndex('residents', ['unit_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('residents');
  },
};
