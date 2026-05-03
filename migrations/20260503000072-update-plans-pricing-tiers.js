'use strict';

/**
 * Revised plan tiers (monthly + annual):
 *   Free              — ₦0,        ≤50  residents, basic
 *   Starter           — ₦8,000/mo, ≤100 residents, basic
 *   Starter Annual    — ₦75,000/yr (save ₦21,000)
 *   Standard          — ₦15,000/mo,≤200 residents, standard
 *   Standard Annual   — ₦140,000/yr (save ₦40,000)
 *   Pro               — ₦35,000/mo,≤500 residents, premium
 *   Pro Annual        — ₦330,000/yr (save ₦90,000)
 *
 * Enterprise (1,000+ units, custom pricing) is UI-only; no DB plan row.
 */

const PLANS = [
  {
    name: 'Free',
    description: 'For small estates getting started — up to 50 units',
    billing_cycle: 'monthly',
    category: 'basic',
    price: 0.00,
    currency: 'NGN',
    duration: 30,
    features: JSON.stringify({
      max_residents: 50,
      access: ['access_code', 'qr_code'],
      amenities: [],
      services: ['community_announcements', 'email_support'],
    }),
  },
  {
    name: 'Starter',
    description: 'For growing estates with up to 100 units',
    billing_cycle: 'monthly',
    category: 'basic',
    price: 8000.00,
    currency: 'NGN',
    duration: 30,
    features: JSON.stringify({
      max_residents: 100,
      access: ['access_code', 'qr_code'],
      amenities: [],
      services: ['community_announcements', 'visitor_analytics', 'email_support'],
    }),
  },
  {
    name: 'Starter Annual',
    description: 'For growing estates with up to 100 units — annual billing',
    billing_cycle: 'annually',
    category: 'basic',
    price: 75000.00,
    currency: 'NGN',
    duration: 365,
    features: JSON.stringify({
      max_residents: 100,
      access: ['access_code', 'qr_code'],
      amenities: [],
      services: ['community_announcements', 'visitor_analytics', 'email_support'],
    }),
  },
  {
    name: 'Standard',
    description: 'For established estates with up to 200 units',
    billing_cycle: 'monthly',
    category: 'standard',
    price: 15000.00,
    currency: 'NGN',
    duration: 30,
    features: JSON.stringify({
      max_residents: 200,
      access: ['access_code', 'qr_code', 'nfc'],
      amenities: ['booking'],
      services: ['visitor_analytics', 'payment_dues', 'amenity_booking', 'priority_support', 'csv_bulk_import'],
    }),
  },
  {
    name: 'Standard Annual',
    description: 'For established estates with up to 200 units — annual billing',
    billing_cycle: 'annually',
    category: 'standard',
    price: 140000.00,
    currency: 'NGN',
    duration: 365,
    features: JSON.stringify({
      max_residents: 200,
      access: ['access_code', 'qr_code', 'nfc'],
      amenities: ['booking'],
      services: ['visitor_analytics', 'payment_dues', 'amenity_booking', 'priority_support', 'csv_bulk_import'],
    }),
  },
  {
    name: 'Pro',
    description: 'For large estates with up to 500 units',
    billing_cycle: 'monthly',
    category: 'premium',
    price: 35000.00,
    currency: 'NGN',
    duration: 30,
    features: JSON.stringify({
      max_residents: 500,
      access: ['access_code', 'qr_code', 'nfc'],
      amenities: ['booking'],
      services: [
        'visitor_analytics',
        'payment_dues',
        'amenity_booking',
        'priority_support',
        'csv_bulk_import',
        'advanced_reporting',
        'multi_gate_management',
        'dedicated_account_manager',
      ],
    }),
  },
  {
    name: 'Pro Annual',
    description: 'For large estates with up to 500 units — annual billing',
    billing_cycle: 'annually',
    category: 'premium',
    price: 330000.00,
    currency: 'NGN',
    duration: 365,
    features: JSON.stringify({
      max_residents: 500,
      access: ['access_code', 'qr_code', 'nfc'],
      amenities: ['booking'],
      services: [
        'visitor_analytics',
        'payment_dues',
        'amenity_booking',
        'priority_support',
        'csv_bulk_import',
        'advanced_reporting',
        'multi_gate_management',
        'dedicated_account_manager',
      ],
    }),
  },
];

module.exports = {
  up: async (queryInterface) => {
    const now = new Date().toISOString();
    for (const plan of PLANS) {
      await queryInterface.sequelize.query(
        `INSERT INTO plans (id, name, description, billing_cycle, category, price, price_paid, currency, duration, features, created_at, updated_at)
         VALUES (gen_random_uuid(), :name, :description, :billing_cycle, :category, :price, :price_paid, :currency, :duration, :features::jsonb, :now, :now)
         ON CONFLICT (name) DO UPDATE SET
           description  = EXCLUDED.description,
           category     = EXCLUDED.category,
           price        = EXCLUDED.price,
           price_paid   = EXCLUDED.price_paid,
           features     = EXCLUDED.features,
           updated_at   = EXCLUDED.updated_at`,
        {
          replacements: {
            name: plan.name,
            description: plan.description,
            billing_cycle: plan.billing_cycle,
            category: plan.category,
            price: plan.price,
            price_paid: plan.price,
            currency: plan.currency,
            duration: plan.duration,
            features: plan.features,
            now,
          },
        }
      );
    }
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query(
      `DELETE FROM plans WHERE name IN ('Free', 'Pro', 'Starter Annual', 'Standard Annual', 'Pro Annual')`
    );
    await queryInterface.sequelize.query(
      `UPDATE plans SET
         description = 'For small upcoming new estates up to 20 units',
         price       = 0.00,
         price_paid  = 0.00,
         features    = '{"max_residents":20,"access":["access_code","qr_code"],"amenities":[],"services":["community_announcements","email_support"]}'::jsonb
       WHERE name = 'Starter'`
    );
  },
};
