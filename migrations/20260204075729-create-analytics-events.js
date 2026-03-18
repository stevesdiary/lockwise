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
    }, { ifNotExists: true });

    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "analytics_events_user_id" ON "analytics_events" ("user_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "analytics_events_event_name" ON "analytics_events" ("event_name")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "analytics_events_created_at" ON "analytics_events" ("created_at")');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('analytics_events');
  }
};
