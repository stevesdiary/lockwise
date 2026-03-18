'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "access_logs"
        DROP COLUMN IF EXISTS "gate_id",
        DROP COLUMN IF EXISTS "is_multi_entry",
        DROP COLUMN IF EXISTS "max_entries",
        DROP COLUMN IF EXISTS "used_entries",
        DROP COLUMN IF EXISTS "valid_from",
        DROP COLUMN IF EXISTS "visitor_details",
        DROP COLUMN IF EXISTS "guest_phone",
        DROP COLUMN IF EXISTS "whatsapp_sent",
        DROP COLUMN IF EXISTS "whatsapp_sent_at";
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "access_logs"
        ADD COLUMN IF NOT EXISTS "gate_id" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "is_multi_entry" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "max_entries" INTEGER,
        ADD COLUMN IF NOT EXISTS "used_entries" INTEGER DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "valid_from" TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS "visitor_details" JSONB,
        ADD COLUMN IF NOT EXISTS "guest_phone" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "whatsapp_sent" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "whatsapp_sent_at" TIMESTAMPTZ;
    `);
  }
};
