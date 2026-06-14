#!/bin/bash

# Quick script to subscribe estate EST005 to free Starter plan
# Usage: ./subscribe-est005.sh

echo "🚀 Subscribing estate EST005 to free Starter plan..."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "   Please set it first:"
  echo "   export DATABASE_URL='postgresql://user:password@host:port/database'"
  exit 1
fi

# Run the SQL command
psql "$DATABASE_URL" << 'EOF'
-- Subscribe EST005 to Starter plan
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

-- Verify subscription
SELECT 
  '✅ SUCCESS!' as status,
  e.name as estate_name,
  e.estate_code,
  p.name as plan_name,
  s.status,
  s.subscription_state,
  TO_CHAR(s.start_date, 'YYYY-MM-DD') as start_date,
  TO_CHAR(s.end_date, 'YYYY-MM-DD') as end_date,
  s.resident_cap
FROM subscriptions s
JOIN estates e ON s.estate_id = e.estate_id
JOIN plans p ON s.plan_id = p.id
WHERE e.estate_code = 'EST005'
  AND s.status = 'active'
ORDER BY s.created_at DESC
LIMIT 1;
EOF

if [ $? -eq 0 ]; then
  echo ""
  echo "🎉 Estate EST005 is now subscribed to the free Starter plan!"
  echo "   Users should now be able to access the system."
else
  echo ""
  echo "❌ Failed to create subscription. Check the error above."
  exit 1
fi
