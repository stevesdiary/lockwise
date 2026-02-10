'use strict';
const { randomUUID } = require('crypto');

module.exports = {
  up: async (queryInterface) => {
    const existingRoles = await queryInterface.sequelize.query(
      'SELECT role FROM roles',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const existingRoleNames = existingRoles.map(r => r.role);

    const roles = [
      { id: randomUUID(), role: 'master', description: 'Master - Full system access, approve estates, assign managers' },
      { id: randomUUID(), role: 'admin', description: 'Admin - Manage all estates' },
      { id: randomUUID(), role: 'manager', description: 'Manager - Manage own estate only' },
      { id: randomUUID(), role: 'security', description: 'Security - Gate operations' },
      { id: randomUUID(), role: 'resident', description: 'Resident - Basic access' },
      { id: randomUUID(), role: 'staff', description: 'Staff - Limited access' },
      { id: randomUUID(), role: 'customer_support', description: 'Customer Support - Help desk operations' }
    ].filter(r => !existingRoleNames.includes(r.role));

    if (roles.length > 0) {
      await queryInterface.bulkInsert('roles', roles.map(r => ({
        ...r,
        created_at: new Date(),
        updated_at: new Date()
      })));
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('roles', null, {});
  }
};
