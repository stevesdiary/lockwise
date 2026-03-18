'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "residents" ADD COLUMN IF NOT EXISTS "address" TEXT;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "residents" DROP COLUMN IF EXISTS "address";
    `);
  }
};
