'use strict';

// Converts unit_type from a rigid ENUM to VARCHAR so new types (villa, etc.)
// can be added by updating the model only — no future migrations needed.
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE units
        ALTER COLUMN unit_type TYPE VARCHAR
        USING unit_type::VARCHAR
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE units ALTER COLUMN unit_type SET DEFAULT 'flat'
    `);
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS "enum_units_unit_type"
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Restore ENUM — values present at time of migration; cannot recover unknown values
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_units_unit_type" AS ENUM(
        'flat','duplex','chalet','terrace','plot','house','apartment','villa','other'
      )
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE units
        ALTER COLUMN unit_type TYPE "enum_units_unit_type"
        USING unit_type::"enum_units_unit_type"
    `);
  },
};
