'use strict';

const PLANS = [
  {
    name: 'Starter',
    description: 'For small upcoming new estates up to 20 units',
    billing_cycle: 'monthly',
    category: 'basic',
    price: 0.00,
    currency: 'NGN',
    duration: 30,
    features: JSON.stringify({
      max_residents: 20,
      access: ['access_code', 'qr_code'],
      amenities: [],
      services: ['community_announcements', 'email_support'],
    }),
  },
  {
    name: 'Standard',
    description: 'For estates with more than 20 units',
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
];

module.exports = {
  up: async (queryInterface) => {
    const now = new Date().toISOString();
    for (const plan of PLANS) {
      await queryInterface.sequelize.query(
        `INSERT INTO plans (id, name, description, billing_cycle, category, price, currency, duration, features, created_at, updated_at)
         VALUES (gen_random_uuid(), :name, :description, :billing_cycle, :category, :price, :currency, :duration, :features::jsonb, :now, :now)
         ON CONFLICT (name) DO NOTHING`,
        {
          replacements: {
            name: plan.name,
            description: plan.description,
            billing_cycle: plan.billing_cycle,
            category: plan.category,
            price: plan.price,
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
      `DELETE FROM plans WHERE name IN ('Starter', 'Standard')`
    );
  },
};
