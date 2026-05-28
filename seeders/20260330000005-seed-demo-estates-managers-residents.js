"use strict";

const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");

// ─── Seed data ────────────────────────────────────────────────────────────────

const MANAGER_PASSWORD = "Manager@1234";
const RESIDENT_PASSWORD = "Resident@1234";

const ESTATES = [
  {
    name: "Greenview Estate",
    city: "Lagos",
    state: "Lagos",
    country: "Nigeria",
    type: "residential",
  },
  {
    name: "Sunrise Court",
    city: "Abuja",
    state: "FCT",
    country: "Nigeria",
    type: "residential",
  },
  {
    name: "Palm Gardens",
    city: "Port Harcourt",
    state: "Rivers",
    country: "Nigeria",
    type: "mixed",
  },
  {
    name: "Royal Heights",
    city: "Ikeja",
    state: "Lagos",
    country: "Nigeria",
    type: "residential",
  },
  {
    name: "Cedar Park",
    city: "Ibadan",
    state: "Oyo",
    country: "Nigeria",
    type: "residential",
  },
];

const MANAGER_NAMES = [
  { first_name: "Adewale", last_name: "Okafor" },
  { first_name: "Funmilayo", last_name: "Balogun" },
  { first_name: "Chukwudi", last_name: "Nwosu" },
  { first_name: "Yetunde", last_name: "Adeyemi" },
  { first_name: "Emeka", last_name: "Eze" },
];

// 3 residents per estate
const RESIDENT_NAMES = [
  [
    { first_name: "Tunde", last_name: "Fashola" },
    { first_name: "Ngozi", last_name: "Obi" },
    { first_name: "Bola", last_name: "Tinubu" },
  ],
  [
    { first_name: "Amara", last_name: "Chukwu" },
    { first_name: "Seun", last_name: "Kuti" },
    { first_name: "Damilola", last_name: "Okonkwo" },
  ],
  [
    { first_name: "Chioma", last_name: "Nwachukwu" },
    { first_name: "Femi", last_name: "Otedola" },
    { first_name: "Ife", last_name: "Bankole" },
  ],
  [
    { first_name: "Kemi", last_name: "Adeola" },
    { first_name: "Dotun", last_name: "Olaiya" },
    { first_name: "Sola", last_name: "Adesanya" },
  ],
  [
    { first_name: "Biodun", last_name: "Fatoyinbo" },
    { first_name: "Taiwo", last_name: "Afolabi" },
    { first_name: "Kehinde", last_name: "Salami" },
  ],
];

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    // ── 0. Idempotency guard ───────────────────────────────────────────────────
    const existing = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'manager1@greenviewestate.lockwise.dev' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );
    if (existing.length) {
      console.log('Demo seed already applied — skipping.');
      return;
    }

    // ── 1. Fetch role IDs ──────────────────────────────────────────────────────
    const roles = await queryInterface.sequelize.query(
      `SELECT id, role FROM roles WHERE role IN ('manager', 'resident')`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const managerRoleId = roles.find((r) => r.role === "manager")?.id;
    const residentRoleId = roles.find((r) => r.role === "resident")?.id;

    if (!managerRoleId || !residentRoleId) {
      throw new Error(
        "Required roles (manager, resident) not found. Run role seeds first.",
      );
    }

    // ── 2. Fetch Starter plan ID ───────────────────────────────────────────────
    const plans = await queryInterface.sequelize.query(
      `SELECT id FROM plans WHERE name = 'Starter' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT },
    );

    const starterPlanId = plans[0]?.id;

    if (!starterPlanId) {
      throw new Error(
        "Starter plan not found. Run plans seed (migration 20260403000055) first.",
      );
    }

    // ── 3. Hash passwords (once each, reuse for all of same type) ─────────────
    const managerHash = await bcrypt.hash(MANAGER_PASSWORD, 10);
    const residentHash = await bcrypt.hash(RESIDENT_PASSWORD, 10);

    // ── 4. Pre-generate UUIDs for all entities ────────────────────────────────
    const estateIds = ESTATES.map(() => randomUUID());
    const managerIds = ESTATES.map(() => randomUUID());
    const residentUserIds = ESTATES.map(() => [
      randomUUID(),
      randomUUID(),
      randomUUID(),
    ]);
    const residentRecordIds = ESTATES.map(() => [
      randomUUID(),
      randomUUID(),
      randomUUID(),
    ]);
    // 2 streets per estate, 3 units per street (6 units/estate)
    const streetIds = ESTATES.map(() => [randomUUID(), randomUUID()]);
    const unitIds = ESTATES.map(() => [
      [randomUUID(), randomUUID(), randomUUID()],
      [randomUUID(), randomUUID(), randomUUID()],
    ]);
    // 2 gates per estate (main + service)
    const gateIds = ESTATES.map(() => [randomUUID(), randomUUID()]);

    // ── 5. Insert manager users WITHOUT estate_id first ───────────────────────
    const managerRows = ESTATES.map((estate, i) => {
      const slug = estate.name.toLowerCase().replace(/\s+/g, "");
      return {
        id: managerIds[i],
        first_name: MANAGER_NAMES[i].first_name,
        last_name: MANAGER_NAMES[i].last_name,
        email: `manager${i + 1}@${slug}.lockwise.dev`,
        phone: `+2348${String(10000000 + i).slice(1)}`,
        password: managerHash,
        role_id: managerRoleId,
        estate_id: null,
        status: "active",
        user_type: "manager",
        verified: true,
        oauth_enabled: false,
        consent_given: true,
        consent_timestamp: now,
        created_at: now,
        updated_at: now,
      };
    });

    await queryInterface.bulkInsert("users", managerRows);

    // ── 6. Insert estates referencing manager user IDs ────────────────────────
    const estateRows = ESTATES.map((estate, i) => ({
      estate_id: estateIds[i],
      name: estate.name,
      type: estate.type,
      city: estate.city,
      state: estate.state,
      country: estate.country,
      country_code: "NG",
      timezone: "Africa/Lagos",
      currency_code: "NGN",
      estate_code: `EST${String(i + 1).padStart(3, "0")}`,
      total_number_of_apartments: 50,
      status: "active",
      approval_status: "approved",
      approved_on: now,
      plan_id: starterPlanId,
      onboarding_step: 3,
      setup_checklist: JSON.stringify({
        gates_configured: true,
        residents_invited: true,
      }),
      created_by: managerIds[i],
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert("estates", estateRows);

    // ── 7. Update manager users to set estate_id ──────────────────────────────
    for (let i = 0; i < ESTATES.length; i++) {
      await queryInterface.sequelize.query(
        `UPDATE users SET estate_id = :estateId WHERE id = :userId`,
        { replacements: { estateId: estateIds[i], userId: managerIds[i] } },
      );
    }

    // ── 8. Insert resident users ───────────────────────────────────────────────
    const residentUserRows = [];
    ESTATES.forEach((estate, estateIdx) => {
      const slug = estate.name.toLowerCase().replace(/\s+/g, "");
      RESIDENT_NAMES[estateIdx].forEach((name, resIdx) => {
        residentUserRows.push({
          id: residentUserIds[estateIdx][resIdx],
          first_name: name.first_name,
          last_name: name.last_name,
          email: `${name.first_name.toLowerCase()}.${name.last_name.toLowerCase()}@${slug}.lockwise.dev`,
          phone: `+2347${String(10000000 + estateIdx * 3 + resIdx).slice(1)}`,
          password: residentHash,
          role_id: residentRoleId,
          estate_id: estateIds[estateIdx],
          status: "active",
          user_type: "resident",
          verified: true,
          oauth_enabled: false,
          consent_given: true,
          consent_timestamp: now,
          created_at: now,
          updated_at: now,
        });
      });
    });

    await queryInterface.bulkInsert("users", residentUserRows);

    // ── 9. Insert streets (2 per estate) ──────────────────────────────────────
    const streetRows = [];
    ESTATES.forEach((_, estateIdx) => {
      ["Main Street", "Palm Avenue"].forEach((name, sIdx) => {
        streetRows.push({
          street_id: streetIds[estateIdx][sIdx],
          name,
          estate_id: estateIds[estateIdx],
          created_at: now,
          updated_at: now,
        });
      });
    });
    await queryInterface.bulkInsert("streets", streetRows);

    // ── 10. Insert units (3 per street = 6 per estate) ────────────────────────
    const unitRows = [];
    const unitTypes = ["apartment", "apartment", "house"];
    ESTATES.forEach((_, estateIdx) => {
      streetIds[estateIdx].forEach((streetId, sIdx) => {
        unitIds[estateIdx][sIdx].forEach((unitId, uIdx) => {
          unitRows.push({
            id: unitId,
            street_id: streetId,
            unit_identifier: `${sIdx === 0 ? "A" : "B"}${uIdx + 1}0${estateIdx + 1}`,
            block: sIdx === 0 ? "Block A" : "Block B",
            floor: uIdx,
            unit_type: unitTypes[uIdx],
            created_at: now,
            updated_at: now,
          });
        });
      });
    });
    await queryInterface.bulkInsert("units", unitRows);

    // ── 11. Insert residents table records, assigned to units ─────────────────
    // Residents 0-2 → units A101, A201, A301 (first street, all 3 units)
    const residentRecordRows = [];
    ESTATES.forEach((_, estateIdx) => {
      RESIDENT_NAMES[estateIdx].forEach((_, resIdx) => {
        residentRecordRows.push({
          resident_id: residentRecordIds[estateIdx][resIdx],
          user_id: residentUserIds[estateIdx][resIdx],
          estate_id: estateIds[estateIdx],
          unit_id: unitIds[estateIdx][0][resIdx], // each resident gets a unit on Main Street
          subscribed: false,
          created_at: now,
          updated_at: now,
        });
      });
    });

    await queryInterface.bulkInsert("residents", residentRecordRows);

    // ── 12. Insert gates (main + service per estate) ───────────────────────────
    const gateRows = [];
    const gateConfigs = [
      {
        suffix: "MAIN",
        gate_name: "Main Gate",
        gate_type: "main",
        access_control_type: "qr_code",
      },
      {
        suffix: "SVC",
        gate_name: "Service Gate",
        gate_type: "service",
        access_control_type: "manual",
      },
    ];

    ESTATES.forEach((_, estateIdx) => {
      gateConfigs.forEach((cfg, gIdx) => {
        gateRows.push({
          gate_id: gateIds[estateIdx][gIdx],
          estate_id: estateIds[estateIdx],
          gate_code: `GATE-EST${String(estateIdx + 1).padStart(3, "0")}-${cfg.suffix}`,
          gate_name: cfg.gate_name,
          gate_type: cfg.gate_type,
          access_control_type: cfg.access_control_type,
          is_active: true,
          created_at: now,
          updated_at: now,
        });
      });
    });

    await queryInterface.bulkInsert("gates", gateRows);

    // ── 13. Insert active Starter subscriptions ────────────────────────────────
    const subscriptionRows = ESTATES.map((_, i) => ({
      id: randomUUID(),
      estate_id: estateIds[i],
      plan_id: starterPlanId,
      start_date: now,
      end_date: oneYearLater,
      status: "active",
      auto_renew: true,
      paid_on: now,
      created_at: now,
      updated_at: now,
    }));

    await queryInterface.bulkInsert("subscriptions", subscriptionRows);

    console.log(
      "✓ Seeded 5 estates, 5 managers, 15 residents, 10 streets, 30 units, 10 gates, 5 subscriptions",
    );
  },

  down: async (queryInterface) => {
    // Remove in FK-safe order
    await queryInterface.sequelize.query(
      `DELETE FROM subscriptions WHERE estate_id IN (
         SELECT estate_id FROM estates WHERE estate_code IN ('EST001','EST002','EST003','EST004','EST005')
       )`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM gates WHERE estate_id IN (
         SELECT estate_id FROM estates WHERE estate_code IN ('EST001','EST002','EST003','EST004','EST005')
       )`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM units WHERE street_id IN (
        SELECT street_id FROM streets WHERE estate_id IN (
          SELECT estate_id FROM estates WHERE estate_code IN ('EST001','EST002','EST003','EST004','EST005')
         )
       )`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM streets WHERE estate_id IN (
         SELECT estate_id FROM estates WHERE estate_code IN ('EST001','EST002','EST003','EST004','EST005')
       )`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM residents WHERE user_id IN (
         SELECT id FROM users WHERE email LIKE '%@%.lockwise.dev'
       )`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM users WHERE email LIKE '%@%.lockwise.dev'`,
    );
    await queryInterface.sequelize.query(
      `DELETE FROM estates WHERE estate_code IN ('EST001','EST002','EST003','EST004','EST005')`,
    );
  },
};
