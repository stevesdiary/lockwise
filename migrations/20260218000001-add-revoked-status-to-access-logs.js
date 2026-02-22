'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'revoked' to the status enum
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_access_logs_status" ADD VALUE 'revoked';
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Note: PostgreSQL doesn't support removing enum values directly
    // This would require recreating the enum type and updating the column
    // For now, we'll leave this as a no-op since removing enum values is complex
    console.log('Rollback not implemented - PostgreSQL does not support removing enum values');
  }
};