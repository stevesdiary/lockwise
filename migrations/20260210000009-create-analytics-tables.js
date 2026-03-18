'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('analytics_events', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      user_id: { type: Sequelize.UUID, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      event_name: { type: Sequelize.STRING(100), allowNull: false },
      properties: { type: Sequelize.JSONB },
      session_id: { type: Sequelize.STRING(255) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    }, { ifNotExists: true });

    await queryInterface.createTable('performance_metrics', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      endpoint: { type: Sequelize.STRING(255), allowNull: false },
      method: { type: Sequelize.STRING(10), allowNull: false },
      response_time_ms: { type: Sequelize.INTEGER, allowNull: false },
      status_code: { type: Sequelize.INTEGER, allowNull: false },
      memory_usage_mb: { type: Sequelize.DECIMAL(10, 2) },
      cpu_usage_percent: { type: Sequelize.DECIMAL(5, 2) },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    }, { ifNotExists: true });

    await queryInterface.createTable('system_health', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
      service_name: { type: Sequelize.STRING(50), allowNull: false },
      status: { type: Sequelize.STRING(20), allowNull: false, validate: { isIn: [['healthy', 'degraded', 'unhealthy']] } },
      response_time_ms: { type: Sequelize.INTEGER },
      error_message: { type: Sequelize.TEXT },
      metadata: { type: Sequelize.JSONB },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()') }
    }, { ifNotExists: true });

    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_analytics_events_user" ON "analytics_events" ("user_id")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_analytics_events_name" ON "analytics_events" ("event_name")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_analytics_events_created" ON "analytics_events" ("created_at")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_performance_metrics_endpoint" ON "performance_metrics" ("endpoint")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_performance_metrics_created" ON "performance_metrics" ("created_at")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_system_health_service" ON "system_health" ("service_name")');
    await queryInterface.sequelize.query('CREATE INDEX IF NOT EXISTS "idx_system_health_created" ON "system_health" ("created_at")');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('system_health');
    await queryInterface.dropTable('performance_metrics');
    await queryInterface.dropTable('analytics_events');
  }
};
