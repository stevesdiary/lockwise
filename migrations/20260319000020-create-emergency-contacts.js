'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('emergency_contacts', {
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
      name: { type: Sequelize.STRING, allowNull: false },
      type: {
        type: Sequelize.ENUM('fire', 'police', 'ambulance', 'hospital', 'security', 'maintenance'),
        allowNull: false,
      },
      phone: { type: Sequelize.STRING, allowNull: false },
      email: { type: Sequelize.STRING, allowNull: true },
      address: { type: Sequelize.STRING, allowNull: true },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });

    await queryInterface.addIndex('emergency_contacts', ['estate_id']);
    await queryInterface.addIndex('emergency_contacts', ['type']);
    await queryInterface.addIndex('emergency_contacts', ['is_active']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('emergency_contacts');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_emergency_contacts_type"');
  },
};
