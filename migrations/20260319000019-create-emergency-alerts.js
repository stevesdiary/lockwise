'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('emergency_alerts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      estate_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'estates', key: 'estate_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      type: {
        type: Sequelize.ENUM('fire', 'medical', 'security', 'flood', 'power_outage', 'other'),
        allowNull: false,
      },
      description: { type: Sequelize.TEXT, allowNull: true },
      location: { type: Sequelize.STRING, allowNull: true },
      status: {
        type: Sequelize.ENUM('active', 'resolved', 'false_alarm'),
        allowNull: false,
        defaultValue: 'active',
      },
      resolved_at: { type: Sequelize.DATE, allowNull: true },
      resolved_by: { type: Sequelize.UUID, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('emergency_alerts', ['estate_id']);
    await queryInterface.addIndex('emergency_alerts', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('emergency_alerts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_emergency_alerts_type"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_emergency_alerts_status"');
  },
};
