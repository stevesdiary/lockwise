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
      { id: randomUUID(), role: 'super_admin', description: 'Full system access' },
      { id: randomUUID(), role: 'admin', description: 'Estate administration' },
      { id: randomUUID(), role: 'manager', description: 'Estate management' },
      { id: randomUUID(), role: 'security', description: 'Security operations' },
      { id: randomUUID(), role: 'resident', description: 'Resident access' },
      { id: randomUUID(), role: 'domestic_staff', description: 'Staff access' },
      { id: randomUUID(), role: 'customer_service', description: 'Customer support' }
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
