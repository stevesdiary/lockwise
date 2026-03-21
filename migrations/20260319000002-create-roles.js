'use strict';

// Matches UserRole enum in src/shared/constants/permissions.ts
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM(
          'master',
          'super_admin',
          'admin',
          'manager',
          'security',
          'resident',
          'domestic_staff',
          'customer_service'
        ),
        allowNull: false,
        unique: true,
      },
      description: { type: Sequelize.STRING, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('roles');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_roles_role"');
  },
};
