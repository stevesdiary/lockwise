# Estate Subscription Scripts

Scripts to manage estate subscriptions, particularly for subscribing estates to the free Starter plan.

## Quick Start - Subscribe EST005 to Free Plan

### Option 1: Bash Script (Fastest)
```bash
cd lockwise-server
export DATABASE_URL='postgresql://user:password@host:port/lockwise'
./scripts/subscribe-est005.sh
```

### Option 2: SQL Script (Manual)
```bash
cd lockwise-server
psql "$DATABASE_URL" -f scripts/subscribe-estate-free-plan.sql
```

### Option 3: TypeScript Script (Programmatic)
```bash
cd lockwise-server
npx ts-node scripts/subscribe-estate-free-plan.ts
```

## What These Scripts Do

All scripts subscribe estate **EST005** to the **Starter** (free) plan with:
- ✅ 1 year subscription
- ✅ Active status
- ✅ Up to 20 residents
- ✅ Access codes & QR codes
- ✅ Community announcements
- ✅ Email support
- ✅ **FREE (₦0.00)**

## Files

| File | Purpose | Usage |
|------|---------|-------|
| `subscribe-est005.sh` | Quick bash script | `./subscribe-est005.sh` |
| `subscribe-estate-free-plan.sql` | SQL commands | `psql -f script.sql` |
| `subscribe-estate-free-plan.ts` | TypeScript script | `npx ts-node script.ts` |

## Prerequisites

### For Bash Script
- `psql` installed
- `DATABASE_URL` environment variable set

### For SQL Script
- Database access
- `psql` or any SQL client

### For TypeScript Script
- Node.js and TypeScript installed
- Database connection configured in `.env`

## Environment Variables

```bash
# Required for bash script
export DATABASE_URL='postgresql://username:password@host:5432/lockwise'

# Or use individual variables (for TypeScript script)
export DB_HOST='localhost'
export DB_PORT='5432'
export DB_NAME='lockwise'
export DB_USER='postgres'
export DB_PASSWORD='your-password'
```

## Verification

After running any script, verify the subscription:

```sql
SELECT 
  e.estate_code,
  p.name as plan,
  s.status,
  s.subscription_state,
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
estate_code | plan    | status | subscription_state | end_date   | resident_cap
------------|---------|--------|-------------------|------------|-------------
EST005      | Starter | active | ACTIVE            | 2025-XX-XX | 20
```

## Troubleshooting

### Error: Estate not found
```sql
-- Check if estate exists
SELECT estate_id, name, estate_code FROM estates WHERE estate_code = 'EST005';
```

### Error: Plan not found
```sql
-- Check if Starter plan exists
SELECT id, name, price FROM plans WHERE name = 'Starter';

-- If not found, run migrations
npx sequelize-cli db:migrate
```

### Error: Subscription already exists
```sql
-- Check existing subscriptions
SELECT id, status, end_date 
FROM subscriptions 
WHERE estate_id = (SELECT estate_id FROM estates WHERE estate_code = 'EST005');

-- Cancel old subscription if needed
UPDATE subscriptions 
SET status = 'cancelled', cancel_reason = 'Replaced'
WHERE estate_id = (SELECT estate_id FROM estates WHERE estate_code = 'EST005')
  AND status = 'active';
```

### Users still blocked after subscription
1. Restart application server
2. Clear cache (Redis if applicable)
3. Verify subscription state is 'ACTIVE'
4. Check feature gate configuration

## For Other Estates

To subscribe a different estate, modify the scripts:

### Bash Script
```bash
# Edit subscribe-est005.sh
# Change: WHERE e.estate_code = 'EST005'
# To:     WHERE e.estate_code = 'YOUR_CODE'
```

### SQL Script
```sql
-- Edit subscribe-estate-free-plan.sql
-- Change all instances of 'EST005' to your estate code
```

### TypeScript Script
```typescript
// Edit subscribe-estate-free-plan.ts
// Change: where: { estate_code: 'EST005' }
// To:     where: { estate_code: 'YOUR_CODE' }
```

## Documentation

Full documentation: [SUBSCRIBE_ESTATE_FREE_PLAN.md](../docs/SUBSCRIBE_ESTATE_FREE_PLAN.md)

## Support

If issues persist:
1. Check database connection
2. Verify estate and plan exist
3. Review application logs
4. Contact development team

---

**Quick Command**:
```bash
export DATABASE_URL='your-connection-string' && ./scripts/subscribe-est005.sh
```
