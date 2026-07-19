'use strict';

const { v4: uuidv4 } = require('uuid');

// Correct pricing per LOCKWISE_Pricing_and_Subscription_Model.docx
// 3 paid tiers × 3 billing cycles = 9 plans + 1 Enterprise (custom/UI-only)
// No permanent Free tier — estates get a 30-day trial on first resident approval

// duration in days per billing cycle
const DURATION = { monthly: 30, quarterly: 90, annually: 365 };

const PLANS = [
  // Starter — 200 resident cap
  {
    id: uuidv4(), name: 'starter_monthly', description: 'Starter plan billed monthly',
    billing_cycle: 'monthly', price: 40000, price_paid: 40000, duration: DURATION.monthly, resident_cap: 200,
    plan_tier: 'starter', category: 'standard', currency: 'NGN',
    features: JSON.stringify({ all_features: true }),
  },
  {
    id: uuidv4(), name: 'starter_quarterly', description: 'Starter plan billed quarterly',
    billing_cycle: 'quarterly', price: 110000, price_paid: 110000, duration: DURATION.quarterly, resident_cap: 200,
    plan_tier: 'starter', category: 'standard', currency: 'NGN',
    features: JSON.stringify({ all_features: true }),
  },
  {
    id: uuidv4(), name: 'starter_annually', description: 'Starter plan billed annually',
    billing_cycle: 'annually', price: 380000, price_paid: 380000, duration: DURATION.annually, resident_cap: 200,
    plan_tier: 'starter', category: 'standard', currency: 'NGN',
    features: JSON.stringify({ all_features: true }),
  },

  // Growth — 500 resident cap
  {
    id: uuidv4(), name: 'growth_monthly', description: 'Growth plan billed monthly',
    billing_cycle: 'monthly', price: 65000, price_paid: 65000, duration: DURATION.monthly, resident_cap: 500,
    plan_tier: 'growth', category: 'standard', currency: 'NGN',
    features: JSON.stringify({ all_features: true }),
  },
  {
    id: uuidv4(), name: 'growth_quarterly', description: 'Growth plan billed quarterly',
    billing_cycle: 'quarterly', price: 180000, price_paid: 180000, duration: DURATION.quarterly, resident_cap: 500,
    plan_tier: 'growth', category: 'standard', currency: 'NGN',
    features: JSON.stringify({ all_features: true }),
  },
  {
    id: uuidv4(), name: 'growth_annually', description: 'Growth plan billed annually',
    billing_cycle: 'annually', price: 620000, price_paid: 620000, duration: DURATION.annually, resident_cap: 500,
    plan_tier: 'growth', category: 'standard', currency: 'NGN',
    features: JSON.stringify({ all_features: true }),
  },

  // Estate Pro — 999 resident cap
  {
    id: uuidv4(), name: 'estate_pro_monthly', description: 'Estate Pro plan billed monthly',
    billing_cycle: 'monthly', price: 170000, price_paid: 170000, duration: DURATION.monthly, resident_cap: 999,
    plan_tier: 'estate_pro', category: 'standard', currency: 'NGN',
    features: JSON.stringify({ all_features: true }),
  },
  {
    id: uuidv4(), name: 'estate_pro_quarterly', description: 'Estate Pro plan billed quarterly',
    billing_cycle: 'quarterly', price: 460000, price_paid: 460000, duration: DURATION.quarterly, resident_cap: 999,
    plan_tier: 'estate_pro', category: 'standard', currency: 'NGN',
    features: JSON.stringify({ all_features: true }),
  },
  {
    id: uuidv4(), name: 'estate_pro_annually', description: 'Estate Pro plan billed annually',
    billing_cycle: 'annually', price: 1630000, price_paid: 1630000, duration: DURATION.annually, resident_cap: 999,
    plan_tier: 'estate_pro', category: 'standard', currency: 'NGN',
    features: JSON.stringify({ all_features: true }),
  },

  // Enterprise — 1000+ residents, custom pricing (UI-only, no Paystack plan)
  {
    id: uuidv4(), name: 'enterprise', description: 'Enterprise plan — custom pricing, contact sales',
    billing_cycle: 'monthly', price: 0, price_paid: 0, duration: 30, resident_cap: null,
    plan_tier: 'enterprise', category: 'standard', currency: 'NGN',
    features: JSON.stringify({ all_features: true, hardware_integration: true }),
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    // Temporarily drop NOT NULL on plan_id so we can null out old references
    await queryInterface.sequelize.query(
      'ALTER TABLE subscriptions ALTER COLUMN plan_id DROP NOT NULL'
    );

    // Null out plan references so FK constraints don't block the delete
    await queryInterface.sequelize.query(
      'UPDATE subscriptions SET plan_id = NULL WHERE plan_id IS NOT NULL'
    );

    // Wipe all existing plans (Free, Starter ₦8k, Standard ₦15k, Pro ₦35k from migration 072;
    // and the 18-plan seed from migration 092 which had incorrect prices)
    await queryInterface.sequelize.query('DELETE FROM plans');

    // Insert correct plans
    const now = new Date();
    await queryInterface.bulkInsert('plans', PLANS.map(p => ({
      ...p,
      is_active: true,
      created_at: now,
      updated_at: now,
    })));

    // Re-add NOT NULL constraint on plan_id
    await queryInterface.sequelize.query(
      'ALTER TABLE subscriptions ALTER COLUMN plan_id SET NOT NULL'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('DELETE FROM plans');
  },
};
