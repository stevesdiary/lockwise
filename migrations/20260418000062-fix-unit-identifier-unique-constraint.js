'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Drop the global unique constraint on unit_identifier
    await queryInterface.removeIndex('units', ['unit_identifier']);

    // Add composite unique constraint: identifier must be unique per street, not globally
    await queryInterface.addIndex('units', ['unit_identifier', 'street_id'], {
      unique: true,
      name: 'units_unit_identifier_street_id_unique',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('units', 'units_unit_identifier_street_id_unique');

    await queryInterface.addIndex('units', ['unit_identifier'], {
      unique: true,
    });
  },
};
