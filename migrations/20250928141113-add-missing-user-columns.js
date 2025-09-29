'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add role_id column
    await queryInterface.addColumn('users', 'role_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Add estate_id column
    await queryInterface.addColumn('users', 'estate_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'estates',
        key: 'estate_id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'role_id');
    await queryInterface.removeColumn('users', 'estate_id');
  }
};