/**
 * Script to subscribe estate EST005 to the free Starter plan
 * 
 * This will:
 * 1. Find the estate by estate_code EST005
 * 2. Find the Starter (free) plan
 * 3. Create an active subscription for 1 year
 * 4. Set subscription_state to ACTIVE
 */

import sequelize from './src/shared/core/database';
import { Estate } from './src/modules/estate/models/estate.model';
import { Plan } from './src/modules/payment/models/plan.model';
import { Subscription } from './src/modules/payment/models/subscription.model';

async function subscribeEstateToFreePlan() {
  try {
    console.log('🔍 Looking up estate EST005...');
    
    // Find estate by estate_code
    const estate = await Estate.findOne({
      where: { estate_code: 'EST005' }
    });

    if (!estate) {
      console.error('❌ Estate with code EST005 not found');
      process.exit(1);
    }

    console.log(`✅ Found estate: ${estate.name} (ID: ${estate.estate_id})`);

    // Find the Starter (free) plan
    console.log('🔍 Looking up Starter plan...');
    const starterPlan = await Plan.findOne({
      where: { name: 'Starter' }
    });

    if (!starterPlan) {
      console.error('❌ Starter plan not found');
      process.exit(1);
    }

    console.log(`✅ Found plan: ${starterPlan.name} (Price: ${starterPlan.price} ${starterPlan.currency})`);

    // Check for existing active subscription
    const existingSubscription = await Subscription.findOne({
      where: {
        estate_id: estate.estate_id,
        status: 'active'
      }
    });

    if (existingSubscription) {
      console.log('⚠️  Estate already has an active subscription');
      console.log(`   Subscription ID: ${existingSubscription.id}`);
      console.log(`   Status: ${existingSubscription.status}`);
      console.log(`   State: ${existingSubscription.subscription_state}`);
      console.log(`   End Date: ${existingSubscription.end_date}`);
      
      const answer = await new Promise<string>((resolve) => {
        process.stdin.once('data', (data) => resolve(data.toString().trim()));
        console.log('\n❓ Do you want to cancel it and create a new one? (yes/no): ');
      });

      if (answer.toLowerCase() !== 'yes') {
        console.log('❌ Aborted');
        process.exit(0);
      }

      // Cancel existing subscription
      await existingSubscription.update({
        status: 'cancelled',
        cancel_reason: 'Replaced with free Starter plan'
      });
      console.log('✅ Cancelled existing subscription');
    }

    // Create new subscription
    console.log('📝 Creating new subscription...');
    
    const now = new Date();
    const endDate = new Date(now);
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year subscription

    const subscription = await Subscription.create({
      estate_id: estate.estate_id,
      plan_id: starterPlan.id,
      status: 'active',
      subscription_state: 'ACTIVE',
      start_date: now,
      end_date: endDate,
      auto_renew: true,
      paid_on: now, // Mark as paid since it's free
      resident_count: 0,
      resident_cap: 20, // Starter plan cap
      trial_start_date: null,
      trial_end_date: null,
      grace_period_end_date: null,
      lapsed_start_date: null,
      wallet_payment_enabled: false
    });

    console.log('\n✅ SUCCESS! Subscription created:');
    console.log(`   Subscription ID: ${subscription.id}`);
    console.log(`   Estate: ${estate.name} (${estate.estate_code})`);
    console.log(`   Plan: ${starterPlan.name}`);
    console.log(`   Status: ${subscription.status}`);
    console.log(`   State: ${subscription.subscription_state}`);
    console.log(`   Start Date: ${subscription.start_date}`);
    console.log(`   End Date: ${subscription.end_date}`);
    console.log(`   Resident Cap: ${subscription.resident_cap}`);
    console.log(`   Auto Renew: ${subscription.auto_renew}`);

    console.log('\n🎉 Estate EST005 is now subscribed to the free Starter plan!');
    console.log('   Users should now be able to access the system.');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the script
subscribeEstateToFreePlan();
