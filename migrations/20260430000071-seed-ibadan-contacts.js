'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    // Fetch the IDs we need from existing seed data
    const [nigeriaRows] = await queryInterface.sequelize.query(
      "SELECT id FROM countries WHERE iso_code = 'NG' LIMIT 1"
    );
    const [oyoRows] = await queryInterface.sequelize.query(
      "SELECT id FROM states WHERE name = 'Oyo' LIMIT 1"
    );
    const [ibadanRows] = await queryInterface.sequelize.query(
      "SELECT id FROM cities WHERE name = 'Ibadan' LIMIT 1"
    );
    const [policeRows] = await queryInterface.sequelize.query(
      "SELECT id FROM emergency_contact_categories WHERE name = 'Police' LIMIT 1"
    );
    const [fireRows] = await queryInterface.sequelize.query(
      "SELECT id FROM emergency_contact_categories WHERE name = 'Fire Service' LIMIT 1"
    );
    const [ambulanceRows] = await queryInterface.sequelize.query(
      "SELECT id FROM emergency_contact_categories WHERE name = 'Ambulance' LIMIT 1"
    );
    const [hospitalRows] = await queryInterface.sequelize.query(
      "SELECT id FROM emergency_contact_categories WHERE name = 'Hospital' LIMIT 1"
    );
    const [rapidRows] = await queryInterface.sequelize.query(
      "SELECT id FROM emergency_contact_categories WHERE name = 'Rapid Response' LIMIT 1"
    );

    if (!nigeriaRows.length || !oyoRows.length || !ibadanRows.length) {
      console.warn('Ibadan seed: required location rows not found — skipping');
      return;
    }

    const nigeriaId = nigeriaRows[0].id;
    const oyoId = oyoRows[0].id;
    const ibadanId = ibadanRows[0].id;
    const catPolice = policeRows[0]?.id;
    const catFire = fireRows[0]?.id;
    const catAmbulance = ambulanceRows[0]?.id;
    const catHospital = hospitalRows[0]?.id;
    const catRapid = rapidRows[0]?.id;
    const now = new Date();

    // Oyo State-level contacts
    await queryInterface.bulkInsert('location_emergency_contacts', [
      { id: uuidv4(), category_id: catPolice, name: 'Oyo State Police Command', phone_number: '08039283333', alt_phone_number: '07055175554', country_id: nigeriaId, state_id: oyoId, city_id: null, description: 'Oyo State police emergency headquarters', is_active: true, priority: 5, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catFire, name: 'Oyo State Fire Service', phone_number: '08062754752', alt_phone_number: null, country_id: nigeriaId, state_id: oyoId, city_id: null, description: 'Oyo State fire emergencies', is_active: true, priority: 5, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catRapid, name: 'Amotekun Oyo State Security Network', phone_number: '08088101942', alt_phone_number: null, country_id: nigeriaId, state_id: oyoId, city_id: null, description: 'South-West regional rapid response unit', is_active: true, priority: 5, created_at: now, updated_at: now },
    ], {});

    // Ibadan city-level contacts
    await queryInterface.bulkInsert('location_emergency_contacts', [
      { id: uuidv4(), category_id: catPolice, name: 'Iyaganku Police Division Ibadan', phone_number: '07055175554', alt_phone_number: null, country_id: nigeriaId, state_id: oyoId, city_id: ibadanId, description: 'Central Ibadan police division', is_active: true, priority: 1, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catHospital, name: 'University College Hospital (UCH) Ibadan', phone_number: '08077664173', alt_phone_number: '02-2410088', country_id: nigeriaId, state_id: oyoId, city_id: ibadanId, description: 'Premier teaching hospital with 24/7 A&E — Queen Elizabeth Road', is_active: true, priority: 1, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catHospital, name: 'Adeoyo State Hospital Ibadan', phone_number: '08058580948', alt_phone_number: null, country_id: nigeriaId, state_id: oyoId, city_id: ibadanId, description: 'Government hospital — Ring Road, Ibadan', is_active: true, priority: 5, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catAmbulance, name: 'Oyo State Emergency Medical Services (Ibadan)', phone_number: '112', alt_phone_number: '08062001971', country_id: nigeriaId, state_id: oyoId, city_id: ibadanId, description: 'Ambulance dispatch for Ibadan metropolis', is_active: true, priority: 1, created_at: now, updated_at: now },
    ], {});
  },

  async down(queryInterface) {
    const [oyoRows] = await queryInterface.sequelize.query(
      "SELECT id FROM states WHERE name = 'Oyo' LIMIT 1"
    );
    if (!oyoRows.length) return;
    await queryInterface.bulkDelete('location_emergency_contacts', {
      state_id: oyoRows[0].id,
    }, {});
  },
};
