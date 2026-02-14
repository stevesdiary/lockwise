'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove default value first
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN user_type DROP DEFAULT;
    `);

    // Change user_type from ENUM to STRING
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN user_type TYPE VARCHAR(255) 
      USING user_type::text;
    `);

    // Drop the old ENUM type
    await queryInterface.sequelize.query(`
      DROP TYPE IF EXISTS enum_users_user_type CASCADE;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Recreate ENUM type
    await queryInterface.sequelize.query(`
      CREATE TYPE enum_users_user_type AS ENUM ('individual', 'organization');
    `);

    // Change back to ENUM
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN user_type TYPE enum_users_user_type 
      USING user_type::enum_users_user_type;
    `);
    
    // Restore default
    await queryInterface.sequelize.query(`
      ALTER TABLE users 
      ALTER COLUMN user_type SET DEFAULT 'individual';
    `);
  }
};
