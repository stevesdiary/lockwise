# LOCKWISE Subscription System Implementation Summary

## ✅ Completed Components

### 1. Database Migrations
- **20260520000090-add-subscription-state-fields.js**: Adds subscription_state, trial dates, billing_cycle, Paystack codes, resident count/cap, lapsed_start_date
- **20260520000091-create-subscription-events.js**: Creates subscription_events table for logging all state transitions
- **20260520000092-update-plans-with-new-pricing.js**: Updates plans table with new pricing tiers and inserts 18 plans (6 tiers × 3 billing cycles)

### 2. Models
- **SubscriptionEvent**: Logs all subscription state transitions with metadata
- **Subscription**: Updated with new fields (subscription_state, trial dates, billing info, resident tracking)
- **Plan**: Updated with plan_tier and resident_cap fields

### 3. Services
- **enhanced-subscription.service.ts**: Core subscription logic
  - `startTrialForEstate()`: Starts 30-day trial when first resident approved
  - `selectPlan()`: Handles plan selection and Paystack payment initialization
  - `activateSubscription()`: Activates subscription after successful payment
  - `getSubscriptionStatus()`: Returns detailed subscription status with banners
  - `getFeatures()`: Returns feature flags for estate
  - `updateResidentCount()`: Updates resident count on subscription

- **subscription-event.service.ts**: Logs and retrieves subscription events
  - `logEvent()`: Creates event log entry
  - `getEventsBySubscription()`: Gets events for a subscription
  - `getEventsByEstate()`: Gets events for an estate

### 4. Feature Gating
- **feature-flags.types.ts**: Defines feature flags by subscription state
  - TRIAL: All features enabled
  - ACTIVE: All features enabled
  - GRACE: Limited features (no visitor mgmt, staff mgmt, reporting, issue tracking)
  - LAPSED: Gradual degradation over 30 days
    - Days 1-7: Everything works
    - Days 8-14: Reporting disabled
    - Days 15-21: Visitor mgmt & new staff disabled
    - Days 22-30: Manager portal read-only
    - Day 31+: Manager portal locked

- **feature-access.middleware.ts**: Server-side enforcement
  - `checkFeatureAccess(featureName)`: Middleware to gate specific features
  - `checkManagerWriteAccess()`: Enforces read-only mode during lapsed days 22-30

### 5. API Controllers & Routes
- **subscription.controller.ts**: Handles subscription API requests
  - `selectPlan()`: POST /estates/:estateId/subscription/select-plan
  - `getSubscriptionStatus()`: GET /estates/:estateId/subscription/status
  - `getFeatures()`: GET /estates/:estateId/features
  - `upgradePlan()`: POST /estates/:estateId/subscription/upgrade
  - `getAvailablePlans()`: GET /plans

- **subscription.route.ts**: Defines subscription routes with authentication

## 🚧 TODO: Critical Remaining Tasks

### 1. Update Existing Cron Job
**File**: `src/shared/jobs/subscription-expiry.job.ts`

Add trial notification logic:
```typescript
// Day 23 of trial (7 days before expiry)
const in7Days = addDays(now, 7);
const trialReminders7Days = await Subscription.findAll({
  where: {
    subscription_state: 'TRIAL',
    trial_end_date: { [Op.between]: [in7Days, addDays(in7Days, 1)] },
  },
});
// Send notifications...

// Day 27 of trial (3 days before expiry)
const in3Days = addDays(now, 3);
const trialReminders3Days = await Subscription.findAll({
  where: {
    subscription_state: 'TRIAL',
    trial_end_date: { [Op.between]: [in3Days, addDays(in3Days, 1)] },
  },
});
// Send email, push, AND SMS...

// Trial expired → GRACE
const trialExpired = await Subscription.findAll({
  where: {
    subscription_state: 'TRIAL',
    trial_end_date: { [Op.lt]: now },
  },
});
// Transition to GRACE, log event...

// GRACE expired → LAPSED
const graceExpired = await Subscription.findAll({
  where: {
    subscription_state: 'GRACE',
    grace_period_end_date: { [Op.lt]: now },
  },
});
// Transition to LAPSED, set lapsed_start_date, log event...
```

### 2. Update Webhook Handler
**File**: `src/modules/payment/controllers/webhook.controller.ts`

Add subscription activation logic:
```typescript
if (event === 'charge.success') {
  const metadata = data.metadata;
  if (metadata.plan_id && metadata.billing_cycle) {
    // Activate subscription
    await enhancedSubscriptionService.activateSubscription({
      estateId: metadata.estate_id,
      planId: metadata.plan_id,
      billingCycle: metadata.billing_cycle,
      paystackSubscriptionCode: data.subscription_code,
      paystackCustomerCode: data.customer.customer_code,
    });
  }
}
```

### 3. Trigger Trial Start
**File**: `src/modules/auth/services/user.service.ts` or resident approval handler

When first resident is approved:
```typescript
import enhancedSubscriptionService from '../../payment/services/enhanced-subscription.service';

// After approving first resident
await enhancedSubscriptionService.startTrialForEstate(estateId);
await enhancedSubscriptionService.updateResidentCount(estateId);
```

### 4. Register Routes
**File**: `src/app.ts` or main routes file

```typescript
import subscriptionRoutes from './modules/payment/routes/subscription.route';

// Register routes
fastify.register(subscriptionRoutes, { prefix: '/api/v1' });
```

### 5. Apply Feature Gating Middleware
**Example usage on protected routes**:

```typescript
import { checkFeatureAccess } from '../payment/middleware/feature-access.middleware';

// Visitor management routes
fastify.get('/visitors', 
  { preHandler: [authenticate, checkFeatureAccess('visitor_management')] },
  visitorController.getVisitors
);

// Reporting routes
fastify.get('/reports/analytics',
  { preHandler: [authenticate, checkFeatureAccess('reporting_and_analytics')] },
  reportController.getAnalytics
);

// Manager write operations
fastify.post('/residents',
  { preHandler: [authenticate, checkManagerWriteAccess] },
  residentController.createResident
);
```

### 6. Run Migrations
```bash
cd lockwise-server
npx sequelize-cli db:migrate
```

### 7. Create Paystack Subscription Plans
Use Paystack API or dashboard to create subscription plans for each tier/cycle combination:
- starter_monthly, starter_quarterly, starter_annually
- basic_monthly, basic_quarterly, basic_annually
- growth_monthly, growth_quarterly, growth_annually
- estate_pro_monthly, estate_pro_quarterly, estate_pro_annually
- premium_monthly, premium_quarterly, premium_annually

Store plan codes in environment variables or database.

### 8. Environment Variables
Add to `.env`:
```
WEB_PORTAL_URL=https://portal.lockwise.ng
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_PUBLIC_KEY=pk_live_...
```

## 📋 Testing Checklist

- [ ] Run migrations successfully
- [ ] Verify 18 plans created in database
- [ ] Test trial start when first resident approved
- [ ] Test plan selection flow
- [ ] Test Paystack payment callback
- [ ] Test subscription activation
- [ ] Test feature gating middleware on protected routes
- [ ] Test trial expiry notifications (day 23, 27, 30)
- [ ] Test TRIAL → GRACE transition
- [ ] Test GRACE → LAPSED transition
- [ ] Test gradual feature degradation in LAPSED state
- [ ] Test manager portal read-only mode (days 22-30)
- [ ] Test manager portal lockout (day 31+)
- [ ] Verify all state transitions logged to subscription_events

## 🔄 State Transition Flow

```
TRIAL (30 days)
  ↓ (payment during trial)
ACTIVE
  ↓ (subscription expires)
GRACE (7 days)
  ↓ (grace expires)
LAPSED
  ↓ Days 1-7: Full access
  ↓ Days 8-14: Reporting disabled
  ↓ Days 15-21: Visitor mgmt disabled
  ↓ Days 22-30: Read-only mode
  ↓ Day 31+: Portal locked
```

## 📞 Support

For questions or issues during implementation:
1. Check subscription_events table for state transition logs
2. Review feature flags in feature-flags.types.ts
3. Test with different subscription states in development
4. Verify Paystack webhook signatures

## 🎯 Next Phase: Frontend Integration

After backend is complete:
1. Update web portal to call `/estates/:estateId/subscription/status` on dashboard load
2. Display subscription banners based on banner_type
3. Cache feature flags and refresh periodically
4. Show upgrade prompts when features are restricted
5. Implement plan selection UI
6. Handle Paystack payment redirect flow
