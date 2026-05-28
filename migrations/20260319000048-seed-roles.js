'use strict';

// Updated to match UserRole enum in src/shared/constants/permissions.ts
const ROLES = [
  { role: 'master',           description: 'Platform owner with full system access' },
  { role: 'super_admin',      description: 'Super administrator with near-full access' },
  { role: 'admin',            description: 'Estate administrator' },
  { role: 'manager',          description: 'Estate manager' },
  { role: 'security',         description: 'Security personnel at gate' },
  { role: 'resident',         description: 'Estate resident' },
  { role: 'domestic_staff',   description: 'Domestic staff member' },
  { role: 'customer_service', description: 'Customer service agent' },
];

module.exports = {
  up: async (queryInterface) => {
    const now = new Date().toISOString();
    const values = ROLES.map(r => `(gen_random_uuid(), '${r.role}', '${r.description}', '${now}', '${now}')`).join(',');
    await queryInterface.sequelize.query(
      `INSERT INTO roles (id, role, description, created_at, updated_at) VALUES ${values} ON CONFLICT (role) DO NOTHING`
    );
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('roles', { role: ROLES.map((r) => r.role) });
  },
};
