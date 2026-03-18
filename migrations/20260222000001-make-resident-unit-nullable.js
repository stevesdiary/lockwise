'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "residents"
        ALTER COLUMN "unit_id" DROP NOT NULL,
        ALTER COLUMN "estate_id" DROP NOT NULL;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "residents"
        ALTER COLUMN "unit_id" SET NOT NULL,
        ALTER COLUMN "estate_id" SET NOT NULL;
    `);
  }
};
