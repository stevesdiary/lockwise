'use strict';

// Consolidated from two conflicting create migrations (20260204075729 + 20260210000009).
// Uses the more complete definition from 20260210000009 with session_id.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('analytics_events', {
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
      event_name: { type: Sequelize.STRING, allowNull: false },
      properties: { type: Sequelize.JSONB, allowNull: true },
      session_id: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('analytics_events', ['user_id']);
    await queryInterface.addIndex('analytics_events', ['event_name']);
    await queryInterface.addIndex('analytics_events', ['created_at']);
    await queryInterface.addIndex('analytics_events', ['session_id']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('analytics_events');
  },
};
