'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_bulk_upload_jobs_upload_type" ADD VALUE IF NOT EXISTS 'streets_units'`
    );
  },

  down: async (queryInterface) => {
    // PostgreSQL does not support removing ENUM values; document-only rollback
    // To rollback: recreate the type without 'streets_units' and cast the column
  },
};
