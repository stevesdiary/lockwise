# Lockwise Load Tests

## Prerequisites

1. k6 installed (`brew install k6` on macOS)
2. Local server running on port 3002 (`npm run dev`)
3. Database seeded with at least one estate, one resident, one security user

## Running

Export your test credentials first:

```bash
export RESIDENT_EMAIL="your.resident@email.com"
export RESIDENT_PASSWORD="YourPassword"
export SECURITY_EMAIL="security@YOURESTATECODE.lockwise.local"
export SECURITY_PASSWORD="Security@1234"
export ESTATE_ID="your-estate-uuid-here"
```

Then run a stage:

```bash
# Baseline only (10→50 VUs, ~6 min)
npm run load:baseline

# Stress test only (up to 300 VUs, ~14 min)
npm run load:stress

# Spike test only (500 VU burst, ~3 min)
npm run load:spike

# Full sequence: baseline → stress → spike (~30 min)
npm run load:all
```

Or pass env vars inline:

```bash
k6 run \
  -e STAGE=baseline \
  -e RESIDENT_EMAIL=resident@test.com \
  -e RESIDENT_PASSWORD=Test@1234 \
  -e SECURITY_EMAIL=security@EST12345678.lockwise.local \
  -e SECURITY_PASSWORD=Security@1234 \
  -e ESTATE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx \
  tests/load/journey.js
```

## Journey

Each virtual user runs this sequence per iteration:

1. **Estate read** — `GET /api/v1/estate/one/:estateId`
2. **Create access record** — `POST /api/v1/access/` (visitor, 1-hour validity)
3. **Validate code** — `POST /api/v1/access-codes/validate` (as security user)

## Thresholds (auto-fail if breached)

| Metric | Threshold |
|---|---|
| Overall error rate | < 1% |
| `login_duration` p95 | < 800ms |
| `estate_read_duration` p95 | < 300ms |
| `access_create_duration` p95 | < 600ms |
| `access_validate_duration` p95 | < 400ms |
| `http_req_duration` p95 | < 1000ms |

## Output

k6 prints a summary table at the end with percentiles, RPS, and pass/fail per threshold.
For HTML reports: `k6 run --out json=results.json tests/load/journey.js` then use k6's web dashboard.
