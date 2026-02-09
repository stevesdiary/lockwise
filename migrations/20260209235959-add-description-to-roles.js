'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('roles', 'description', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.sequelize.query(
      "ALTER TYPE enum_roles_role ADD VALUE IF NOT EXISTS 'domestic_staff'"
    );
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('roles', 'description');
  }
};
