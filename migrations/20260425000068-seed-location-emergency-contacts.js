'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface) {
    // Categories
    const catPolice = uuidv4(), catFire = uuidv4(), catAmbulance = uuidv4();
    const catHospital = uuidv4(), catRapid = uuidv4(), catUtility = uuidv4();

    await queryInterface.bulkInsert('emergency_contact_categories', [
      { id: catPolice, name: 'Police', icon: 'shield-alert', priority: 10, created_at: new Date(), updated_at: new Date() },
      { id: catFire, name: 'Fire Service', icon: 'fire', priority: 20, created_at: new Date(), updated_at: new Date() },
      { id: catAmbulance, name: 'Ambulance', icon: 'ambulance', priority: 30, created_at: new Date(), updated_at: new Date() },
      { id: catHospital, name: 'Hospital', icon: 'hospital-box', priority: 40, created_at: new Date(), updated_at: new Date() },
      { id: catRapid, name: 'Rapid Response', icon: 'siren', priority: 50, created_at: new Date(), updated_at: new Date() },
      { id: catUtility, name: 'Utility Emergency', icon: 'lightning-bolt', priority: 60, created_at: new Date(), updated_at: new Date() },
    ], { ignoreDuplicates: true });

    // Country
    const nigeriaId = uuidv4();
    await queryInterface.bulkInsert('countries', [
      { id: nigeriaId, name: 'Nigeria', iso_code: 'NG', phone_prefix: '+234', created_at: new Date() },
    ], { ignoreDuplicates: true });

    // States
    const lagosId = uuidv4(), abujaId = uuidv4(), riversId = uuidv4(), oyoId = uuidv4();
    await queryInterface.bulkInsert('states', [
      { id: lagosId, country_id: nigeriaId, name: 'Lagos', code: 'LA', created_at: new Date() },
      { id: abujaId, country_id: nigeriaId, name: 'Federal Capital Territory', code: 'FC', created_at: new Date() },
      { id: riversId, country_id: nigeriaId, name: 'Rivers', code: 'RI', created_at: new Date() },
      { id: oyoId, country_id: nigeriaId, name: 'Oyo', code: 'OY', created_at: new Date() },
    ], { ignoreDuplicates: true });

    // Cities
    const lekkiId = uuidv4(), ikejaId = uuidv4(), phId = uuidv4(), ibadanId = uuidv4();
    await queryInterface.bulkInsert('cities', [
      { id: lekkiId, state_id: lagosId, name: 'Lekki', created_at: new Date() },
      { id: ikejaId, state_id: lagosId, name: 'Ikeja', created_at: new Date() },
      { id: phId, state_id: riversId, name: 'Port Harcourt', created_at: new Date() },
      { id: ibadanId, state_id: oyoId, name: 'Ibadan', created_at: new Date() },
    ], { ignoreDuplicates: true });

    const now = new Date();
    // National contacts (no state/city)
    await queryInterface.bulkInsert('location_emergency_contacts', [
      { id: uuidv4(), category_id: catPolice, name: 'Nigeria Police Force Emergency', phone_number: '112', alt_phone_number: '767', country_id: nigeriaId, state_id: null, city_id: null, description: 'National emergency hotline — 24/7', is_active: true, priority: 10, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catAmbulance, name: 'National Ambulance Service', phone_number: '112', alt_phone_number: null, country_id: nigeriaId, state_id: null, city_id: null, description: 'Medical emergencies — 24/7', is_active: true, priority: 10, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catFire, name: 'Federal Fire Service', phone_number: '112', alt_phone_number: '01-7900000', country_id: nigeriaId, state_id: null, city_id: null, description: 'Fire emergencies — 24/7', is_active: true, priority: 10, created_at: now, updated_at: now },
    ], {});

    // Lagos State contacts
    await queryInterface.bulkInsert('location_emergency_contacts', [
      { id: uuidv4(), category_id: catPolice, name: 'Lagos Rapid Response Squad (RRS)', phone_number: '08055700000', alt_phone_number: '08023353333', country_id: nigeriaId, state_id: lagosId, city_id: null, description: 'Quick response to emergencies in Lagos', is_active: true, priority: 5, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catFire, name: 'Lagos State Fire Service', phone_number: '01-7900000', alt_phone_number: '767', country_id: nigeriaId, state_id: lagosId, city_id: null, description: 'Lagos fire emergencies', is_active: true, priority: 5, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catAmbulance, name: 'LASAMBUS', phone_number: '767', alt_phone_number: '01-7900000', country_id: nigeriaId, state_id: lagosId, city_id: null, description: 'Free ambulance service in Lagos', is_active: true, priority: 5, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catHospital, name: 'Lagos University Teaching Hospital (LUTH)', phone_number: '01-5453891', alt_phone_number: '01-5454489', country_id: nigeriaId, state_id: lagosId, city_id: null, description: 'Major teaching hospital with 24/7 emergency', is_active: true, priority: 10, created_at: now, updated_at: now },
    ], {});

    // Lekki (city) contacts
    await queryInterface.bulkInsert('location_emergency_contacts', [
      { id: uuidv4(), category_id: catPolice, name: 'Lekki Police Division', phone_number: '08036886772', alt_phone_number: null, country_id: nigeriaId, state_id: lagosId, city_id: lekkiId, description: 'Local police division for Lekki area', is_active: true, priority: 1, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catHospital, name: 'Reddington Hospital Lekki', phone_number: '01-2715340', alt_phone_number: null, country_id: nigeriaId, state_id: lagosId, city_id: lekkiId, description: '24/7 emergency services', is_active: true, priority: 5, created_at: now, updated_at: now },
    ], {});

    // Abuja (FCT) contacts
    await queryInterface.bulkInsert('location_emergency_contacts', [
      { id: uuidv4(), category_id: catPolice, name: 'FCT Police Command', phone_number: '08032003913', alt_phone_number: null, country_id: nigeriaId, state_id: abujaId, city_id: null, description: 'Abuja police emergency', is_active: true, priority: 5, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catAmbulance, name: 'FCT Emergency Management Agency (FEMA)', phone_number: '112', alt_phone_number: '08075000999', country_id: nigeriaId, state_id: abujaId, city_id: null, description: 'Emergency response for FCT', is_active: true, priority: 5, created_at: now, updated_at: now },
    ], {});

    // Port Harcourt contacts
    await queryInterface.bulkInsert('location_emergency_contacts', [
      { id: uuidv4(), category_id: catPolice, name: 'Rivers State Police Command', phone_number: '08033210703', alt_phone_number: null, country_id: nigeriaId, state_id: riversId, city_id: null, description: 'Rivers State police emergency', is_active: true, priority: 5, created_at: now, updated_at: now },
      { id: uuidv4(), category_id: catHospital, name: 'UPTH (University of Port Harcourt Teaching Hospital)', phone_number: '084-230258', alt_phone_number: null, country_id: nigeriaId, state_id: riversId, city_id: phId, description: 'Major hospital with 24/7 emergency', is_active: true, priority: 10, created_at: now, updated_at: now },
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('location_emergency_contacts', null, {});
    await queryInterface.bulkDelete('cities', null, {});
    await queryInterface.bulkDelete('states', null, {});
    await queryInterface.bulkDelete('countries', null, {});
    await queryInterface.bulkDelete('emergency_contact_categories', null, {});
  },
};
