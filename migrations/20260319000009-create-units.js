'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('units', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      street_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'streets', key: 'street_id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      unit_identifier: { type: Sequelize.STRING, allowNull: true, unique: true },
      unit_details: { type: Sequelize.JSONB, allowNull: true, defaultValue: {} },
      block: { type: Sequelize.STRING, allowNull: true },
      floor: { type: Sequelize.INTEGER, allowNull: true },
      unit_type: {
        type: Sequelize.ENUM(
          'flat', 'duplex', 'chalet', 'terrace',
          'plot', 'house', 'apartment', 'other'
        ),
        allowNull: true,
        defaultValue: 'flat',
      },
      status: {
        type: Sequelize.ENUM('occupied', 'vacant', 'under_construction', 'reserved'),
        allowNull: false,
        defaultValue: 'vacant',
      },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });

    await queryInterface.addIndex('units', ['street_id']);
    await queryInterface.addIndex('units', ['unit_identifier']);
    await queryInterface.addIndex('units', ['status']);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('units');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_units_unit_type"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_units_status"');
  },
};
