'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('gates', {
      gate_id: {
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
      gate_code: { type: Sequelize.STRING, allowNull: false, unique: true },
      gate_name: { type: Sequelize.STRING, allowNull: false },
      gate_type: {
        type: Sequelize.ENUM('main', 'service', 'pedestrian', 'emergency', 'vip'),
        allowNull: false,
        defaultValue: 'main',
      },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      coordinates: { type: Sequelize.JSONB, allowNull: true },
      operating_hours: { type: Sequelize.JSONB, allowNull: true },
      access_control_type: {
        type: Sequelize.ENUM('manual', 'rfid', 'biometric', 'qr_code', 'hybrid'),
        allowNull: true,
        defaultValue: 'manual',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('gates', ['estate_id']);
    await queryInterface.addIndex('gates', ['gate_code']);
    await queryInterface.addIndex('gates', ['is_active']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('gates');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_gates_gate_type"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_gates_access_control_type"');
  },
};
