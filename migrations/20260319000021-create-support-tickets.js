'use strict';

// FIXED from original migration: uses assigned_agent_id (not assigned_to) to match SupportTicket model.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('support_tickets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      assigned_agent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      subject: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: false },
      status: {
        type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'closed'),
        allowNull: false,
        defaultValue: 'open',
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium',
      },
      category: {
        type: Sequelize.ENUM('technical', 'billing', 'access', 'general'),
        allowNull: false,
        defaultValue: 'general',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('support_tickets', ['user_id']);
    await queryInterface.addIndex('support_tickets', ['status']);
    await queryInterface.addIndex('support_tickets', ['assigned_agent_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('support_tickets');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_support_tickets_status"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_support_tickets_priority"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_support_tickets_category"');
  },
};
