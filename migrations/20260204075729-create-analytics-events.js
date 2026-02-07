'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('analytics_events', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      event_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      properties: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('analytics_events', ['user_id']);
    await queryInterface.addIndex('analytics_events', ['event_name']);
    await queryInterface.addIndex('analytics_events', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('analytics_events');
  }
};
