'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('system_health', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      service_name: { type: Sequelize.STRING, allowNull: false },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        // 'healthy' | 'degraded' | 'unhealthy'
      },
      response_time_ms: { type: Sequelize.INTEGER, allowNull: true },
      error_message: { type: Sequelize.TEXT, allowNull: true },
      metadata: { type: Sequelize.JSONB, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('system_health', ['service_name']);
    await queryInterface.addIndex('system_health', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('system_health');
  },
};
