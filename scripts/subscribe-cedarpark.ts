/**
 * Subscribe Cedar Park (EST005) to Starter Monthly plan
 */

import sequelize from '../src/shared/core/database';
import { Plan } from '../src/modules/payment/models/plan.model';
import { Subscription } from '../src/modules/payment/models/subscription.model';

const ESTATE_ID = '8e9ab13d-9d0a-4d22-9d12-3273ce36601f';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ DB connected');

    const plan = await Plan.findOne({ where: { name: 'starter_monthly' } });
    if (!plan) {
      console.error('❌ starter_monthly plan not found');
      process.exit(1);
    }
    console.log(`✅ Plan: ${plan.name} — ₦${plan.price} / ${plan.billing_cycle}`);

    // Cancel any existing active subscription
    await Subscription.update(
      { status: 'cancelled' },
      { where: { estate_id: ESTATE_ID, status: 'active' } }
    );

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + (plan.duration || 30));

    const subscription = await Subscription.create({
      estate_id: ESTATE_ID,
      plan_id: plan.id,
      status: 'active',
      subscription_state: 'ACTIVE',
      start_date: now,
      end_date: endDate,
      auto_renew: true,
      paid_on: now,
      resident_count: 0,
      resident_cap: plan.resident_cap || 50,
      trial_start_date: null,
      trial_end_date: null,
      grace_period_end_date: null,
      lapsed_start_date: null,
      wallet_payment_enabled: false,
    });

    console.log('\n🎉 Subscription created:');
    console.log(`   ID: ${subscription.id}`);
    console.log(`   Plan: ${plan.name}`);
    console.log(`   State: ACTIVE`);
    console.log(`   Start: ${now.toISOString()}`);
    console.log(`   End: ${endDate.toISOString()}`);
    console.log(`   Resident Cap: ${subscription.resident_cap}`);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

run();
