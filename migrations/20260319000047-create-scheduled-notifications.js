'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('scheduled_notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
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
        onDelete: 'SET NULL',
      },
      template_key: { type: Sequelize.STRING, allowNull: false },
      channels: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
        defaultValue: ['email'],
      },
      recipient_data: { type: Sequelize.JSONB, allowNull: false },
      template_data: { type: Sequelize.JSONB, allowNull: true },
      scheduled_for: { type: Sequelize.DATE, allowNull: false },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'pending' },
      retry_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      sent_at: { type: Sequelize.DATE, allowNull: true },
      error_message: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('scheduled_notifications', ['scheduled_for']);
    await queryInterface.addIndex('scheduled_notifications', ['status']);
    await queryInterface.addIndex('scheduled_notifications', ['user_id']);
    await queryInterface.addIndex('scheduled_notifications', ['estate_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('scheduled_notifications');
  },
};
