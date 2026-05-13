module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add resident_cap column if it doesn't exist
    const [results] = await queryInterface.sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='plans' AND column_name='resident_cap'"
    );
    if (results.length === 0) {
      await queryInterface.addColumn('plans', 'resident_cap', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
    }

    // Add plan_tier column if it doesn't exist
    const [tierResults] = await queryInterface.sequelize.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name='plans' AND column_name='plan_tier'"
    );
    if (tierResults.length === 0) {
      await queryInterface.addColumn('plans', 'plan_tier', {
        type: Sequelize.ENUM('starter', 'basic', 'growth', 'estate_pro', 'premium', 'enterprise'),
        allowNull: true
      });
    }

    // Delete existing plans (testing phase)
    // First, delete subscriptions that reference plans to avoid FK constraint
    await queryInterface.sequelize.query('DELETE FROM subscriptions;');
    await queryInterface.sequelize.query('DELETE FROM plans;');

    // Insert new pricing plans
    const plans = [
      // Starter plans
      { tier: 'starter', cycle: 'monthly', price: 20000, cap: 50 },
      { tier: 'starter', cycle: 'quarterly', price: 54000, cap: 50 },
      { tier: 'starter', cycle: 'annually', price: 190000, cap: 50 },
      
      // Basic plans
      { tier: 'basic', cycle: 'monthly', price: 40000, cap: 100 },
      { tier: 'basic', cycle: 'quarterly', price: 108000, cap: 100 },
      { tier: 'basic', cycle: 'annually', price: 380000, cap: 100 },
      
      // Growth plans
      { tier: 'growth', cycle: 'monthly', price: 75000, cap: 150 },
      { tier: 'growth', cycle: 'quarterly', price: 200000, cap: 150 },
      { tier: 'growth', cycle: 'annually', price: 700000, cap: 150 },
      
      // Estate Pro plans
      { tier: 'estate_pro', cycle: 'monthly', price: 150000, cap: 300 },
      { tier: 'estate_pro', cycle: 'quarterly', price: 400000, cap: 300 },
      { tier: 'estate_pro', cycle: 'annually', price: 1400000, cap: 300 },
      
      // Premium plans
      { tier: 'premium', cycle: 'monthly', price: 250000, cap: 500 },
      { tier: 'premium', cycle: 'quarterly', price: 675000, cap: 500 },
      { tier: 'premium', cycle: 'annually', price: 2400000, cap: 500 },
      
      // Enterprise plans (custom pricing)
      { tier: 'enterprise', cycle: 'monthly', price: 0, cap: 1000 },
      { tier: 'enterprise', cycle: 'quarterly', price: 0, cap: 1000 },
      { tier: 'enterprise', cycle: 'annually', price: 0, cap: 1000 },
    ];

    const planRecords = plans.map(p => ({
      id: Sequelize.literal('gen_random_uuid()'),
      name: `${p.tier}_${p.cycle}`,
      description: `${p.tier.charAt(0).toUpperCase() + p.tier.slice(1).replace('_', ' ')} plan - ${p.cycle} billing`,
      billing_cycle: p.cycle,
      plan_tier: p.tier,
      category: 'standard',
      features: JSON.stringify({
        access_by_code: true,
        visitor_management: true,
        domestic_staff_management: true,
        community_chat: true,
        ice_emergency_alerts: true,
        collections_and_payments: true,
        reporting_and_analytics: true,
        issue_tracking: true
      }),
      duration: p.cycle === 'monthly' ? 30 : p.cycle === 'quarterly' ? 91 : 365,
      price: p.price,
      price_paid: p.price,
      currency: 'NGN',
      resident_cap: p.cap,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('plans', planRecords);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('plans', 'plan_tier');
    await queryInterface.removeColumn('plans', 'resident_cap');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_plans_plan_tier";');
  }
};
