'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if role column exists in users table before removing
    const userTableInfo = await queryInterface.describeTable('users');
    if (userTableInfo.role) {
      await queryInterface.removeColumn('users', 'role');
    }
    
    // Update roles table if it exists with name column instead of role
    const roleTableInfo = await queryInterface.describeTable('roles');
    if (roleTableInfo.name && !roleTableInfo.role) {
      await queryInterface.renameColumn('roles', 'name', 'role');
      await queryInterface.changeColumn('roles', 'role', {
        type: Sequelize.ENUM('resident', 'admin', 'manager', 'security', 'super_admin'),
        allowNull: false
      });
      await queryInterface.addConstraint('roles', {
        fields: ['role'],
        type: 'unique',
        name: 'roles_role_unique'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Add back the role column to users
    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.ENUM('resident', 'manager', 'admin'),
      defaultValue: 'resident'
    });
    
    // Revert roles table changes
    await queryInterface.removeConstraint('roles', 'roles_role_unique');
    await queryInterface.renameColumn('roles', 'role', 'name');
    await queryInterface.changeColumn('roles', 'name', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addConstraint('roles', {
      fields: ['name'],
      type: 'unique',
      name: 'roles_name_unique'
    });
  }
};