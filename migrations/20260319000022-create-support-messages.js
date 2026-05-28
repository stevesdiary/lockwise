'use strict';

// FIXED from original migration: uses sender_id (not user_id) to match SupportMessage model.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('support_messages', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      ticket_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'support_tickets', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sender_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      message: { type: Sequelize.TEXT, allowNull: false },
      is_internal: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('support_messages', ['ticket_id']);
    await queryInterface.addIndex('support_messages', ['sender_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('support_messages');
  },
};
