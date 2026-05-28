'use strict';

/**
 * Seed migration: create one security user per estate.
 *
 * For every existing estate this migration inserts a user with:
 *   role = security, user_type = security, status = active, verified = true
 *   email  = security@<estate_code>.lockwise.local
 *   password = Security@1234  (bcrypt-hashed, salt 10)
 *
 * Existing security users for an estate are left untouched (ON CONFLICT DO NOTHING
 * on the unique (email) column).
 *
 * Default credentials should be changed by the estate manager on first login.
 */

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface) => {
    const now = new Date().toISOString();
    const defaultPassword = 'Security@1234';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Fetch all estates
    const [estates] = await queryInterface.sequelize.query(
      `SELECT estate_id, estate_code, COALESCE(estate_code, estate_id::text) AS code_or_id FROM estates WHERE deleted_at IS NULL`
    );

    if (!estates.length) return;

    // Fetch the security role id
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE role = 'security' LIMIT 1`
    );
    const securityRoleId = roles[0]?.id;
    if (!securityRoleId) throw new Error('Security role not found — run role seed first');

    for (const estate of estates) {
      const code = (estate.estate_code || estate.estate_id).toLowerCase().replace(/[^a-z0-9]/g, '');
      const email = `security@${code}.lockwise.local`;

      await queryInterface.sequelize.query(
        `INSERT INTO users
           (id, first_name, last_name, phone, email, password,
            verified, status, user_type, role_id, estate_id,
            oauth_enabled, created_at, updated_at)
         VALUES
           (gen_random_uuid(), 'Security', 'Officer', '+2340000000000', :email, :password,
            true, 'active', 'security', :roleId, :estateId,
            false, :now, :now)
         ON CONFLICT (email) DO NOTHING`,
        {
          replacements: {
            email,
            password: hashedPassword,
            roleId: securityRoleId,
            estateId: estate.estate_id,
            now,
          },
        }
      );
    }
  },

  down: async (queryInterface) => {
    // Remove only the generated security seed accounts (identifiable by the email pattern)
    await queryInterface.sequelize.query(
      `DELETE FROM users WHERE email LIKE 'security@%.lockwise.local' AND user_type = 'security'`
    );
  },
};
