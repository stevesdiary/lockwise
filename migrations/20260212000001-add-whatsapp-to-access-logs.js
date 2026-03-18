'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "access_logs"
        ADD COLUMN IF NOT EXISTS "guest_name" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "guest_phone" VARCHAR(255),
        ADD COLUMN IF NOT EXISTS "whatsapp_sent" BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS "whatsapp_sent_at" TIMESTAMPTZ;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "access_logs"
        DROP COLUMN IF EXISTS "guest_name",
        DROP COLUMN IF EXISTS "guest_phone",
        DROP COLUMN IF EXISTS "whatsapp_sent",
        DROP COLUMN IF EXISTS "whatsapp_sent_at";
    `);
  }
};
