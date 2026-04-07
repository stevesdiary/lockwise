'use strict';

const { randomUUID } = require('crypto');

const ESTATE_CODES = ['EST001', 'EST002', 'EST003', 'EST004', 'EST005'];

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();

    const estates = await queryInterface.sequelize.query(
      `SELECT estate_id, estate_code FROM estates WHERE estate_code IN (:codes)`,
      {
        replacements: { codes: ESTATE_CODES },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );

    if (!estates.length) {
      console.warn('No demo estates found — run the main demo seed first.');
      return;
    }

    // Check if streets already exist for these estates to avoid duplicates
    const existing = await queryInterface.sequelize.query(
      `SELECT estate_id FROM streets WHERE estate_id IN (:ids)`,
      {
        replacements: { ids: estates.map(e => e.estate_id) },
        type: queryInterface.sequelize.QueryTypes.SELECT,
      }
    );
    const alreadySeeded = new Set(existing.map(r => r.estate_id));

    const streetRows = [];
    const unitRows = [];

    estates.forEach(({ estate_id, estate_code }, estateIdx) => {
      if (alreadySeeded.has(estate_id)) {
        console.log(`Skipping ${estate_code} — streets already exist.`);
        return;
      }

      const streetA = randomUUID();
      const streetB = randomUUID();

      streetRows.push(
        { street_id: streetA, name: 'Main Street',  estate_id, created_at: now, updated_at: now },
        { street_id: streetB, name: 'Palm Avenue',  estate_id, created_at: now, updated_at: now },
      );

      // 3 units per street
      [streetA, streetB].forEach((streetId, sIdx) => {
        const prefix = sIdx === 0 ? 'A' : 'B';
        const block   = sIdx === 0 ? 'Block A' : 'Block B';
        ['apartment', 'apartment', 'house'].forEach((unit_type, uIdx) => {
          unitRows.push({
            id: randomUUID(),
            street_id: streetId,
            unit_identifier: `${prefix}${uIdx + 1}0${estateIdx + 1}`,
            block,
            floor: uIdx,
            unit_type,
            created_at: now,
            updated_at: now,
          });
        });
      });
    });

    if (streetRows.length) await queryInterface.bulkInsert('streets', streetRows);
    if (unitRows.length)  await queryInterface.bulkInsert('units',   unitRows);

    console.log(`✓ Seeded ${streetRows.length} streets and ${unitRows.length} units`);
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `DELETE FROM units WHERE street_id IN (
         SELECT street_id FROM streets WHERE estate_id IN (
           SELECT estate_id FROM estates WHERE estate_code = ANY(:codes)
         )
       )`,
      { replacements: { codes: ESTATE_CODES } }
    );
    await queryInterface.sequelize.query(
      `DELETE FROM streets WHERE estate_id IN (
         SELECT estate_id FROM estates WHERE estate_code = ANY(:codes)
       )`,
      { replacements: { codes: ESTATE_CODES } }
    );
  },
};
