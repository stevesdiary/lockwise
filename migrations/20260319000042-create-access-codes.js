'use strict';

// NEW: This table was missing from migrations but AccessCode model exists and self-registers.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('access_codes', {
      code_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      code: { type: Sequelize.STRING, allowNull: false, unique: true },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'estates', key: 'estate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      guest_name: { type: Sequelize.STRING, allowNull: true },
      valid_from: { type: Sequelize.DATE, allowNull: true },
      valid_until: { type: Sequelize.DATE, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'active' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('access_codes', ['code']);
    await queryInterface.addIndex('access_codes', ['user_id']);
    await queryInterface.addIndex('access_codes', ['estate_id']);
    await queryInterface.addIndex('access_codes', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('access_codes');
  },
};
