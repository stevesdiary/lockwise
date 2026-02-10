'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('support_tickets', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      assigned_agent_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'SET NULL' },
      subject: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.STRING(20), defaultValue: 'open', validate: { isIn: [['open', 'in_progress', 'resolved', 'closed']] } },
      priority: { type: Sequelize.STRING(20), defaultValue: 'medium', validate: { isIn: [['low', 'medium', 'high', 'urgent']] } },
      category: { type: Sequelize.STRING(50), defaultValue: 'general', validate: { isIn: [['technical', 'billing', 'access', 'general']] } },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });

    await queryInterface.createTable('support_messages', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      ticket_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'support_tickets', key: 'id' }, onDelete: 'CASCADE' },
      sender_id: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      message: { type: Sequelize.TEXT, allowNull: false },
      is_internal: { type: Sequelize.BOOLEAN, defaultValue: false },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    });

    await queryInterface.addIndex('support_tickets', ['user_id'], { name: 'idx_support_tickets_user' });
    await queryInterface.addIndex('support_tickets', ['assigned_agent_id'], { name: 'idx_support_tickets_agent' });
    await queryInterface.addIndex('support_tickets', ['status'], { name: 'idx_support_tickets_status' });
    await queryInterface.addIndex('support_tickets', ['priority'], { name: 'idx_support_tickets_priority' });
    await queryInterface.addIndex('support_messages', ['ticket_id'], { name: 'idx_support_messages_ticket' });
    await queryInterface.addIndex('support_messages', ['sender_id'], { name: 'idx_support_messages_sender' });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('support_messages');
    await queryInterface.dropTable('support_tickets');
  }
};
