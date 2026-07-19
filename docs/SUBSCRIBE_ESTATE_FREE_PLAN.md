# Subscribe Estate to Free Plan Guide

## Problem
Estate EST005 users are blocked and prompted to contact Admin because the estate has no active subscription.

## Solution
Subscribe the estate to the free **Starter** plan which provides:
- Up to 20 residents
- Access code and QR code features
- Community announcements
- Email support
- **Price: FREE (₦0.00)**

## Quick Fix - SQL Method (Recommended)

### Step 1: Connect to Database
```bash
# Using psql
psql -h your-db-host -U your-db-user -d lockwise

# Or using your preferred database client
```

### Step 2: Run the Subscription Script
```sql
-- Create subscription for EST005
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
  AND p.name = 'Starter';
```

### Step 3: Verify Subscription
```sql
SELECT 
  s.id as subscription_id,
  e.name as estate_name,
  e.estate_code,
  p.name as plan_name,
  s.status,
  s.subscription_state,
  s.start_date,
  s.end_date,
  s.resident_cap
FROM subscriptions s
JOIN estates e ON s.estate_id = e.estate_id
JOIN plans p ON s.plan_id = p.id
WHERE e.estate_code = 'EST005'
  AND s.status = 'active';
```

Expected output:
```
subscription_id | estate_name | estate_code | plan_name | status | subscription_state | start_date | end_date | resident_cap
----------------|-------------|-------------|-----------|--------|-------------------|------------|----------|-------------
uuid-here       | Estate Name | EST005      | Starter   | active | ACTIVE            | 2024-...   | 2025-... | 20
```

## Alternative Method - TypeScript Script

### Step 1: Run the Script
```bash
cd lockwise-server
npx ts-node scripts/subscribe-estate-free-plan.ts
```

The script will:
1. Find estate EST005
2. Find the Starter plan
3. Check for existing subscriptions
4. Create new subscription if none exists
5. Display confirmation

## What This Does

### Subscription Details
- **Estate**: EST005
- **Plan**: Starter (Free)
- **Duration**: 1 year from creation date
- **Status**: active
- **State**: ACTIVE
- **Resident Cap**: 20 users
- **Auto Renew**: true
- **Price**: ₦0.00 (FREE)

### Features Enabled
✅ Access code generation  
✅ QR code access  
✅ Community announcements  
✅ Email support  
✅ Up to 20 residents  

### Features NOT Included (Upgrade to Standard for these)
❌ NFC access  
❌ Visitor analytics  
❌ Payment dues  
❌ Amenity booking  
❌ CSV bulk import  
❌ Priority support  

## Troubleshooting

### Issue: Estate EST005 not found
**Solution**: Verify the estate code
```sql
SELECT estate_id, name, estate_code FROM estates WHERE estate_code LIKE '%EST005%';
```

### Issue: Starter plan not found
**Solution**: Check if plans are seeded
```sql
SELECT id, name, price FROM plans WHERE name = 'Starter';
```

If not found, run the migration:
```bash
cd lockwise-server
npx sequelize-cli db:migrate
```

### Issue: Subscription already exists
**Solution**: Check existing subscription
```sql
SELECT id, status, subscription_state, end_date 
FROM subscriptions 
WHERE estate_id = (SELECT estate_id FROM estates WHERE estate_code = 'EST005')
ORDER BY created_at DESC;
```

If you need to replace it:
```sql
-- Cancel old subscription
UPDATE subscriptions 
SET status = 'cancelled', 
    cancel_reason = 'Replaced with free plan'
WHERE estate_id = (SELECT estate_id FROM estates WHERE estate_code = 'EST005')
  AND status = 'active';

-- Then run the INSERT script again
```

### Issue: Users still blocked after subscription
**Possible causes**:
1. **Cache issue**: Clear application cache or restart server
2. **Subscription state**: Verify subscription_state is 'ACTIVE'
3. **Feature gate**: Check if feature gates are properly configured

**Verify subscription state**:
```sql
SELECT status, subscription_state, end_date 
FROM subscriptions 
WHERE estate_id = (SELECT estate_id FROM estates WHERE estate_code = 'EST005')
  AND status = 'active';
```

Should show:
- status: 'active'
- subscription_state: 'ACTIVE'
- end_date: Future date (1 year from now)

## Checking Subscription Status

### Via SQL
```sql
-- Full subscription details
SELECT 
  s.*,
  e.name as estate_name,
  e.estate_code,
  p.name as plan_name,
  p.price
FROM subscriptions s
JOIN estates e ON s.estate_id = e.estate_id
JOIN plans p ON s.plan_id = p.id
WHERE e.estate_code = 'EST005'
ORDER BY s.created_at DESC;
```

### Via API
```bash
# Get estate subscription
curl -X GET "https://api.lockwise.app/api/v1/subscriptions/estate/{estate_id}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Upgrading to Paid Plan Later

When the estate wants to upgrade to Standard plan (₦15,000/month):

### Option 1: Via API
```bash
curl -X POST "https://api.lockwise.app/api/v1/subscriptions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estate_id": "estate-uuid",
    "plan_id": "standard-plan-uuid",
    "payment_method": "paystack"
  }'
```

### Option 2: Via Mobile App
1. Manager logs in
2. Goes to Subscription screen
3. Taps "Upgrade Plan"
4. Selects Standard plan
5. Completes payment via Paystack

## Monitoring Subscription

### Check Expiry Date
```sql
SELECT 
  estate_code,
  status,
  subscription_state,
  end_date,
  EXTRACT(DAY FROM (end_date - NOW())) as days_remaining
FROM subscriptions s
JOIN estates e ON s.estate_id = e.estate_id
WHERE e.estate_code = 'EST005'
  AND s.status = 'active';
```

### Check Resident Count vs Cap
```sql
SELECT 
  e.estate_code,
  s.resident_count,
  s.resident_cap,
  s.resident_cap - s.resident_count as remaining_slots
FROM subscriptions s
JOIN estates e ON s.estate_id = e.estate_id
WHERE e.estate_code = 'EST005'
  AND s.status = 'active';
```

## Subscription States Explained

| State | Description | User Access |
|-------|-------------|-------------|
| TRIAL | 30-day trial period | Full access |
| ACTIVE | Paid and active | Full access |
| GRACE | 7-day grace after expiry | Limited access |
| LAPSED | Expired, gradual degradation | Restricted access |

## Free Plan Limitations

### Resident Cap
- Maximum 20 residents
- When limit reached, new residents cannot be added
- Upgrade to Standard for up to 200 residents

### Feature Restrictions
- No visitor analytics
- No payment dues management
- No amenity booking
- No CSV bulk import
- Email support only (no priority support)

### Checking Current Usage
```sql
SELECT 
  COUNT(*) as current_residents,
  s.resident_cap,
  s.resident_cap - COUNT(*) as available_slots
FROM users u
JOIN subscriptions s ON u.estate_id = s.estate_id
JOIN estates e ON u.estate_id = e.estate_id
WHERE e.estate_code = 'EST005'
  AND u.user_type = 'resident'
  AND s.status = 'active'
GROUP BY s.resident_cap;
```

## Next Steps After Subscription

1. **Verify Access**: Have a user from EST005 try to log in
2. **Test Features**: Verify access codes and QR codes work
3. **Monitor Usage**: Check resident count regularly
4. **Plan Upgrade**: When approaching 20 residents, consider upgrading

## Support

If issues persist after subscribing:
1. Check server logs for errors
2. Verify database connection
3. Restart application server
4. Clear Redis cache (if applicable)
5. Contact development team with:
   - Estate code (EST005)
   - Subscription ID
   - Error messages
   - User role attempting access

## Files Reference

- **SQL Script**: `scripts/subscribe-estate-free-plan.sql`
- **TypeScript Script**: `scripts/subscribe-estate-free-plan.ts`
- **This Guide**: `docs/SUBSCRIBE_ESTATE_FREE_PLAN.md`

## Quick Command Summary

```bash
# Connect to database
psql -h host -U user -d lockwise

# Run subscription script
\i scripts/subscribe-estate-free-plan.sql

# Verify subscription
SELECT * FROM subscriptions WHERE estate_id = (
  SELECT estate_id FROM estates WHERE estate_code = 'EST005'
) AND status = 'active';

# Check resident count
SELECT COUNT(*) FROM users WHERE estate_id = (
  SELECT estate_id FROM estates WHERE estate_code = 'EST005'
) AND user_type = 'resident';
```

---

**Status**: Ready to execute  
**Risk**: Low (free plan, no payment required)  
**Impact**: Immediate access restoration for EST005 users  
**Duration**: 1 year subscription
