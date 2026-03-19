'use strict';

// Consolidated from two conflicting create migrations (20260208233625 + 20260210000007).
// Uses the more complete definition from 20260208233625.

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('audit_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: { type: Sequelize.UUID, allowNull: true },
      method: { type: Sequelize.STRING, allowNull: true },
      path: { type: Sequelize.STRING, allowNull: true },
      status_code: { type: Sequelize.INTEGER, allowNull: true },
      ip_address: { type: Sequelize.STRING, allowNull: true },
      user_agent: { type: Sequelize.TEXT, allowNull: true },
      duration_ms: { type: Sequelize.INTEGER, allowNull: true },
      request_body: { type: Sequelize.TEXT, allowNull: true },
      response_body: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('audit_logs', ['user_id']);
    await queryInterface.addIndex('audit_logs', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('audit_logs');
  },
};
