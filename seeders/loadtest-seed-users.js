"use strict";

/**
 * Load Test User Seeder
 *
 * Creates 20 additional load-test-specific users (10 managers, 10 residents)
 * distributed across existing demo estates. These accounts are tagged with
 * a `loadtest` prefix so they can be easily cleaned up.
 *
 * Run: npx sequelize-cli db:seed --seed seeders/loadtest-seed-users.js
 * Undo: npx sequelize-cli db:seed:undo --seed seeders/loadtest-seed-users.js
 */

const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");

const LOAD_TEST_PASSWORD = "LoadTest@1234";
const NUM_MANAGERS = 10;
const NUM_RESIDENTS = 10;

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    // Idempotency guard
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email LIKE 'loadtest-%' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    if (existing.length) {
      console.log("Load test users already seeded — skipping.");
      return;
    }

    // Fetch role IDs
    const roles = await queryInterface.sequelize.query(
      `SELECT id, role FROM roles WHERE role IN ('manager', 'resident')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const managerRoleId = roles.find((r) => r.role === "manager")?.id;
    const residentRoleId = roles.find((r) => r.role === "resident")?.id;

    if (!managerRoleId || !residentRoleId) {
      throw new Error("Required roles not found. Run role seeds first.");
    }

    // Fetch existing estates
    const estates = await queryInterface.sequelize.query(
      `SELECT estate_id FROM estates WHERE status = 'active' ORDER BY created_at LIMIT 5`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!estates.length) {
      throw new Error("No active estates found. Run demo seed first.");
    }

    const hash = await bcrypt.hash(LOAD_TEST_PASSWORD, 10);
    const users = [];

    // Create manager users
    for (let i = 0; i < NUM_MANAGERS; i++) {
      const estateId = estates[i % estates.length].estate_id;
      users.push({
        id: randomUUID(),
        first_name: `LoadManager`,
        last_name: `${i + 1}`,
        email: `loadtest-manager-${i + 1}@lockwise.dev`,
        phone: `+2340800000${String(i).padStart(3, "0")}`,
        password: hash,
        role_id: managerRoleId,
        estate_id: estateId,
        status: "active",
        user_type: "manager",
        verified: true,
        oauth_enabled: false,
        consent_given: true,
        consent_timestamp: now,
        created_at: now,
        updated_at: now,
      });
    }

    // Create resident users
    for (let i = 0; i < NUM_RESIDENTS; i++) {
      const estateId = estates[i % estates.length].estate_id;
      users.push({
        id: randomUUID(),
        first_name: `LoadResident`,
        last_name: `${i + 1}`,
        email: `loadtest-resident-${i + 1}@lockwise.dev`,
        phone: `+2340900000${String(i).padStart(3, "0")}`,
        password: hash,
        role_id: residentRoleId,
        estate_id: estateId,
        status: "active",
        user_type: "resident",
        verified: true,
        oauth_enabled: false,
        consent_given: true,
        consent_timestamp: now,
        created_at: now,
        updated_at: now,
      });
    }

    await queryInterface.bulkInsert("users", users);

    // Create resident records for resident users
    const residentUsers = users.filter((u) => u.user_type === "resident");
    const units = await queryInterface.sequelize.query(
      `SELECT id, street_id FROM units LIMIT ${NUM_RESIDENTS}`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (units.length) {
      const residentRecords = residentUsers.map((u, i) => ({
        resident_id: randomUUID(),
        user_id: u.id,
        estate_id: u.estate_id,
        unit_id: units[i % units.length].id,
        subscribed: false,
        created_at: now,
        updated_at: now,
      }));
      await queryInterface.bulkInsert("residents", residentRecords);
    }

    console.log(
      `✓ Seeded ${NUM_MANAGERS} load-test managers + ${NUM_RESIDENTS} load-test residents`
    );
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `DELETE FROM residents WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'loadtest-%')`
    );
    await queryInterface.sequelize.query(
      `DELETE FROM users WHERE email LIKE 'loadtest-%'`
    );
    console.log("✓ Removed all load test users");
  },
};
