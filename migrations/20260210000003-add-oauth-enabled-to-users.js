'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "oauth_enabled" BOOLEAN NOT NULL DEFAULT false;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "oauth_enabled";
    `);
  }
};
