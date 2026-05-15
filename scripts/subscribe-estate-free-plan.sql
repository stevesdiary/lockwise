-- Subscribe Estate EST005 to Free Starter Plan
-- This script will create an active subscription for estate EST005

-- Step 1: Check if estate exists
SELECT estate_id, name, estate_code 
FROM estates 
WHERE estate_code = 'EST005';

-- Step 2: Check if Starter plan exists
SELECT id, name, price, billing_cycle 
FROM plans 
WHERE name = 'Starter';

-- Step 3: Check for existing active subscriptions
SELECT id, status, subscription_state, start_date, end_date 
FROM subscriptions 
WHERE estate_id = (SELECT estate_id FROM estates WHERE estate_code = 'EST005')
  AND status IN ('active', 'grace_period');

-- Step 4: Cancel any existing active subscriptions (if needed)
-- Uncomment the following lines if you want to cancel existing subscriptions
/*
UPDATE subscriptions 
SET status = 'cancelled', 
    cancel_reason = 'Replaced with free Starter plan',
    updated_at = NOW()
WHERE estate_id = (SELECT estate_id FROM estates WHERE estate_code = 'EST005')
  AND status IN ('active', 'grace_period');
*/

-- Step 5: Create new subscription to Starter plan
INSERT INTO subscriptions (
  id,
  estate_id,
  plan_id,
  status,
  subscription_state,
  start_date,
  end_date,
  auto_renew,
  paid_on,
  resident_count,
  resident_cap,
  trial_start_date,
  trial_end_date,
  grace_period_end_date,
  lapsed_start_date,
  wallet_payment_enabled,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  e.estate_id,
  p.id,
  'active',
  'ACTIVE',
  NOW(),
  NOW() + INTERVAL '1 year',
  true,
  NOW(),
  0,
  20,
  NULL,
  NULL,
  NULL,
  NULL,
  false,
  NOW(),
  NOW()
FROM estates e
CROSS JOIN plans p
WHERE e.estate_code = 'EST005'
  AND p.name = 'Starter'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s 
    WHERE s.estate_id = e.estate_id 
      AND s.status = 'active'
  );

-- Step 6: Verify the subscription was created
SELECT 
  s.id as subscription_id,
  e.name as estate_name,
  e.estate_code,
  p.name as plan_name,
  s.status,
  s.subscription_state,
  s.start_date,
  s.end_date,
  s.resident_cap,
  s.auto_renew
FROM subscriptions s
JOIN estates e ON s.estate_id = e.estate_id
JOIN plans p ON s.plan_id = p.id
WHERE e.estate_code = 'EST005'
  AND s.status = 'active'
ORDER BY s.created_at DESC
LIMIT 1;
