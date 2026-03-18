'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "access_logs"
        DROP COLUMN IF EXISTS "exit_code",
        DROP COLUMN IF EXISTS "scheduled_entry_date",
        DROP COLUMN IF EXISTS "scheduled_entry_end",
        DROP COLUMN IF EXISTS "scheduled_exit_date",
        DROP COLUMN IF EXISTS "scheduled_exit_end",
        DROP COLUMN IF EXISTS "scheduled_entry_time",
        DROP COLUMN IF EXISTS "scheduled_exit_time",
        DROP COLUMN IF EXISTS "vehicle_number",
        DROP COLUMN IF EXISTS "scanned_by",
        DROP COLUMN IF EXISTS "approved_at",
        DROP COLUMN IF EXISTS "actual_entry_time",
        DROP COLUMN IF EXISTS "actual_exit_time",
        DROP COLUMN IF EXISTS "remarks",
        DROP COLUMN IF EXISTS "created_by",
        DROP COLUMN IF EXISTS "deleted_at",
        DROP COLUMN IF EXISTS "unit_id",
        DROP COLUMN IF EXISTS "entry_gate_id",
        DROP COLUMN IF EXISTS "exit_gate_id",
        DROP COLUMN IF EXISTS "verification_method";
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "access_logs"
        ADD COLUMN IF NOT EXISTS "exit_code" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "scheduled_entry_date" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "scheduled_entry_end" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "scheduled_exit_date" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "scheduled_exit_end" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "scheduled_entry_time" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "scheduled_exit_time" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "vehicle_number" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "scanned_by" UUID,
        ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "actual_entry_time" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "actual_exit_time" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "remarks" TEXT,
        ADD COLUMN IF NOT EXISTS "created_by" UUID,
        ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "unit_id" UUID,
        ADD COLUMN IF NOT EXISTS "entry_gate_id" UUID,
        ADD COLUMN IF NOT EXISTS "exit_gate_id" UUID,
        ADD COLUMN IF NOT EXISTS "verification_method" VARCHAR(255);
    `);
  }
};
