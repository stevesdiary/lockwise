'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "verification_code",
        DROP COLUMN IF EXISTS "verification_expires";
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "verification_code" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "verification_expires" TIMESTAMPTZ;
    `);
  }
};
