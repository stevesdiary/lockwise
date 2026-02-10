'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('nfc_cards', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      card_uid: { type: Sequelize.STRING(50), allowNull: false, unique: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      estate_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'estates', key: 'id' }, onDelete: 'CASCADE' },
      status: { type: Sequelize.STRING(20), defaultValue: 'active' },
      issued_date: { type: Sequelize.DATEONLY, defaultValue: Sequelize.literal('CURRENT_DATE') },
      expiry_date: { type: Sequelize.DATEONLY },
      last_used: { type: Sequelize.DATE },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addConstraint('nfc_cards', {
      fields: ['user_id', 'estate_id'],
      type: 'unique',
      name: 'nfc_cards_user_id_estate_id_unique'
    });

    await queryInterface.createTable('nfc_access_logs', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      card_id: { type: Sequelize.UUID, references: { model: 'nfc_cards', key: 'id' }, onDelete: 'SET NULL' },
      card_uid: { type: Sequelize.STRING(50), allowNull: false },
      user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      access_point: { type: Sequelize.STRING(100), allowNull: false },
      access_type: { type: Sequelize.STRING(20), allowNull: false },
      status: { type: Sequelize.STRING(20), allowNull: false },
      denial_reason: { type: Sequelize.STRING(100) },
      timestamp: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.addIndex('nfc_cards', ['card_uid'], { name: 'idx_nfc_cards_uid' });
    await queryInterface.addIndex('nfc_cards', ['user_id'], { name: 'idx_nfc_cards_user' });
    await queryInterface.addIndex('nfc_cards', ['estate_id'], { name: 'idx_nfc_cards_estate' });
    await queryInterface.addIndex('nfc_cards', ['status'], { name: 'idx_nfc_cards_status' });
    await queryInterface.addIndex('nfc_access_logs', ['card_id'], { name: 'idx_nfc_access_logs_card' });
    await queryInterface.addIndex('nfc_access_logs', ['user_id'], { name: 'idx_nfc_access_logs_user' });
    await queryInterface.addIndex('nfc_access_logs', ['timestamp'], { name: 'idx_nfc_access_logs_timestamp' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('nfc_access_logs');
    await queryInterface.dropTable('nfc_cards');
  }
};
