'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'estates_created_by_fkey'
        ) THEN
          ALTER TABLE "estates"
            ADD CONSTRAINT "estates_created_by_fkey"
            FOREIGN KEY ("created_by") REFERENCES "users"("id")
            ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE "estates" DROP CONSTRAINT IF EXISTS "estates_created_by_fkey";
    `);
  }
};
