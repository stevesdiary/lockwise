'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "access_logs"
        ADD COLUMN IF NOT EXISTS "valid_from" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "guest_phone" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "entry_time" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "exit_time" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "scanned_by" UUID,
        ADD COLUMN IF NOT EXISTS "remark" TEXT;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "access_logs"
        DROP COLUMN IF EXISTS "valid_from",
        DROP COLUMN IF EXISTS "guest_phone",
        DROP COLUMN IF EXISTS "entry_time",
        DROP COLUMN IF EXISTS "exit_time",
        DROP COLUMN IF EXISTS "scanned_by",
        DROP COLUMN IF EXISTS "remark";
    `);
  }
};
