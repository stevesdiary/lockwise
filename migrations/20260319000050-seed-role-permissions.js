'use strict';

// Maps each role to its permitted action:resource combinations.
// Derived from ROLE_PERMISSIONS in src/shared/constants/permissions.ts.
const ROLE_PERMISSIONS = {
  master: {
    users: ['approve','read','create','update','delete'],
    estates: ['approve','read','create','update','delete'],
    residents: ['approve','read','create','update','delete'],
    access_codes: ['read','create','update','delete'],
    access_logs: ['read','delete'],
    payments: ['approve','read','create','update','delete'],
    subscriptions: ['approve','read','create','update','delete'],
    roles: ['read','create','update','delete'],
    permissions: ['read','create','update','delete'],
    streets: ['read','create','update','delete'],
    units: ['read','create','update','delete'],
    notifications: ['read','create','update','delete'],
    support_tickets: ['read','create','update','delete'],
    emergency_alerts: ['read','create','update','delete'],
    community_board: ['approve','read','create','update','delete'],
    analytics: ['read'],
    reports: ['read','create'],
    settings: ['read','update'],
  },
  super_admin: {
    users: ['approve','read','create','update','delete'],
    estates: ['approve','read','create','update','delete'],
    residents: ['approve','read','create','update','delete'],
    access_codes: ['read','create','update','delete'],
    access_logs: ['read','delete'],
    payments: ['approve','read','create','update','delete'],
    subscriptions: ['approve','read','create','update','delete'],
    roles: ['read','create','update','delete'],
    permissions: ['read','create','update','delete'],
    streets: ['read','create','update','delete'],
    units: ['read','create','update','delete'],
    notifications: ['read','create','update','delete'],
    support_tickets: ['read','create','update','delete'],
    emergency_alerts: ['read','create','update','delete'],
    community_board: ['approve','read','create','update','delete'],
    analytics: ['read'],
    reports: ['read','create'],
    settings: ['read','update'],
  },
  admin: {
    users: ['approve','read','create','update'],
    estates: ['read','update'],
    residents: ['approve','read','create','update'],
    access_codes: ['read','create','update','delete'],
    access_logs: ['read'],
    payments: ['read','create','update'],
    subscriptions: ['read','update'],
    roles: ['read'],
    permissions: ['read'],
    streets: ['read','create','update'],
    units: ['read','create','update'],
    notifications: ['read','create'],
    support_tickets: ['read','create','update'],
    emergency_alerts: ['read','create'],
    community_board: ['approve','read','create','update','delete'],
    analytics: ['read'],
    reports: ['read','create'],
    settings: ['read','update'],
  },
  manager: {
    users: ['read','create','update'],
    estates: ['read','update'],
    residents: ['read','create','update'],
    access_codes: ['read','create','update'],
    access_logs: ['read'],
    payments: ['read','create'],
    subscriptions: ['read'],
    roles: ['read','update'],
    permissions: ['read'],
    streets: ['read','create','update'],
    units: ['read','create','update'],
    notifications: ['read','create'],
    support_tickets: ['read','create','update'],
    emergency_alerts: ['read','create'],
    community_board: ['approve','read','create','update'],
    analytics: ['read'],
    reports: ['read','create'],
    settings: ['read'],
  },
  security: {
    users: ['read'],
    estates: ['read'],
    residents: ['read'],
    access_codes: ['read','create','approve'],
    access_logs: ['read','create'],
    streets: ['read'],
    units: ['read'],
    notifications: ['read'],
    support_tickets: ['read','create'],
    emergency_alerts: ['read','create'],
    community_board: ['read'],
    reports: ['read'],
  },
  resident: {
    users: ['read'],
    estates: ['read'],
    residents: ['read'],
    access_codes: ['read','create'],
    access_logs: ['read'],
    payments: ['read','create'],
    subscriptions: ['read'],
    streets: ['read'],
    units: ['read'],
    notifications: ['read'],
    support_tickets: ['read','create'],
    emergency_alerts: ['read','create'],
    community_board: ['read','create'],
    settings: ['read','update'],
  },
  domestic_staff: {
    users: ['read'],
    estates: ['read'],
    residents: ['read'],
    access_codes: ['read'],
    access_logs: ['read'],
    streets: ['read'],
    units: ['read'],
    notifications: ['read'],
    support_tickets: ['read','create'],
    emergency_alerts: ['read'],
    community_board: ['read'],
  },
  customer_service: {
    users: ['read'],
    estates: ['read'],
    residents: ['read'],
    access_codes: ['read'],
    access_logs: ['read'],
    payments: ['read'],
    subscriptions: ['read'],
    streets: ['read'],
    units: ['read'],
    notifications: ['read','create'],
    support_tickets: ['read','create','update'],
    emergency_alerts: ['read'],
    community_board: ['read'],
  },
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // Fetch role IDs and permission IDs in bulk
    const [roles, permissions] = await Promise.all([
      queryInterface.sequelize.query('SELECT id, role FROM roles', { type: Sequelize.QueryTypes.SELECT }),
      queryInterface.sequelize.query('SELECT id, action FROM permissions', { type: Sequelize.QueryTypes.SELECT }),
    ]);

    const roleMap = Object.fromEntries(roles.map((r) => [r.role, r.id]));
    const permMap = Object.fromEntries(permissions.map((p) => [p.action, p.id]));

    const rows = [];
    for (const [roleName, resources] of Object.entries(ROLE_PERMISSIONS)) {
      const roleId = roleMap[roleName];
      if (!roleId) continue;
      for (const [resource, actions] of Object.entries(resources)) {
        for (const action of actions) {
          const permId = permMap[`${action}:${resource}`];
          if (!permId) continue;
          rows.push({
            id: Sequelize.literal('gen_random_uuid()'),
            role_id: roleId,
            permission_id: permId,
            created_at: now,
            updated_at: now,
          });
        }
      }
    }

    if (rows.length > 0) {
      const values = rows.map(r => `(gen_random_uuid(), '${r.role_id}', '${r.permission_id}', NOW(), NOW())`).join(',');
      await queryInterface.sequelize.query(
        `INSERT INTO role_permissions (id, role_id, permission_id, created_at, updated_at) VALUES ${values} ON CONFLICT (role_id, permission_id) DO NOTHING`
      );
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('role_permissions', null, {});
  },
};
