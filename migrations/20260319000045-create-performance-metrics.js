'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('performance_metrics', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      endpoint: { type: Sequelize.STRING, allowNull: false },
      method: { type: Sequelize.STRING, allowNull: false },
      response_time_ms: { type: Sequelize.INTEGER, allowNull: true },
      status_code: { type: Sequelize.INTEGER, allowNull: true },
      memory_usage_mb: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      cpu_usage_percent: { type: Sequelize.DECIMAL(5, 2), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('performance_metrics', ['endpoint']);
    await queryInterface.addIndex('performance_metrics', ['created_at']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('performance_metrics');
  },
};
