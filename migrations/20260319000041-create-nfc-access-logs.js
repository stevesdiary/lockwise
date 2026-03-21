'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('nfc_access_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      card_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'nfc_cards', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      card_uid: { type: Sequelize.STRING(50), allowNull: false },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      access_point: { type: Sequelize.STRING(100), allowNull: false },
      access_type: { type: Sequelize.STRING(20), allowNull: false },
      status: { type: Sequelize.STRING(20), allowNull: false },
      denial_reason: { type: Sequelize.STRING(100), allowNull: true },
      timestamp: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });

    await queryInterface.addIndex('nfc_access_logs', ['card_id']);
    await queryInterface.addIndex('nfc_access_logs', ['user_id']);
    await queryInterface.addIndex('nfc_access_logs', ['timestamp']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('nfc_access_logs');
  },
};
