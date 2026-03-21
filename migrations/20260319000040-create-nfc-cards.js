'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('nfc_cards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      card_uid: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'estates', key: 'estate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'active' },
      issued_date: { type: Sequelize.DATEONLY, allowNull: false, defaultValue: Sequelize.NOW },
      expiry_date: { type: Sequelize.DATEONLY, allowNull: true },
      last_used: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('nfc_cards', ['card_uid']);
    await queryInterface.addIndex('nfc_cards', ['user_id']);
    await queryInterface.addIndex('nfc_cards', ['estate_id']);
    await queryInterface.addIndex('nfc_cards', ['status']);
    await queryInterface.addIndex('nfc_cards', ['user_id', 'estate_id'], { unique: true });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('nfc_cards');
  },
};
