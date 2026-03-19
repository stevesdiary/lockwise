'use strict';

// All action:resource permission combinations used in ROLE_PERMISSIONS.
const ACTIONS   = ['approve', 'read', 'create', 'update', 'delete'];
const RESOURCES = [
  'users', 'estates', 'residents', 'access_codes', 'access_logs',
  'payments', 'subscriptions', 'roles', 'permissions', 'streets',
  'units', 'notifications', 'support_tickets', 'emergency_alerts',
  'community_board', 'analytics', 'reports', 'settings',
];

module.exports = {
  up: async (queryInterface) => {
    const now = new Date().toISOString();
    const rows = [];
    for (const action of ACTIONS) {
      for (const resource of RESOURCES) {
        rows.push(`(gen_random_uuid(), '${action}:${resource}', '${action} on ${resource}', '${now}', '${now}')`);
      }
    }
    await queryInterface.sequelize.query(
      `INSERT INTO permissions (id, action, description, created_at, updated_at) VALUES ${rows.join(',')} ON CONFLICT (action) DO NOTHING`
    );
  },

  down: async (queryInterface) => {
    const actions = ACTIONS.flatMap((a) => RESOURCES.map((r) => `${a}:${r}`));
    await queryInterface.bulkDelete('permissions', { action: actions });
  },
};
