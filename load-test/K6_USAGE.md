# K6 Load Testing — Lockwise

## Prerequisites

1. **Install k6**: `brew install k6` (macOS) or see [k6.io/docs/get-started](https://k6.io/docs/get-started/installation/)
2. **Server running locally**: `NODE_ENV=development` on port 3002
3. **Seed load test users**:
   ```bash
   cd load-test && npm run seed
   ```
4. **Redis running** (for Bull queue tests): `redis-server` or Docker

## Quick Start

```bash
cd lockwise-server/load-test

# Smoke test (2 VUs, 1 min) — verify everything works
npm run test:smoke

# Full suite (smoke → load → stress → spike, ~37 min total)
npm run test:full
```

## Available Commands

| Command | What it does |
|---------|-------------|
| `npm run seed` | Create 20 load test user accounts |
| `npm run seed:undo` | Remove load test users |
| `npm run test:smoke` | 2 VUs, 1 min — sanity check |
| `npm run test:load` | Ramp 0→80 VUs, 17 min — normal traffic |
| `npm run test:stress` | 20→200 req/s, 12 min — find breaking point |
| `npm run test:spike` | 5→200→5 VUs, 6 min — sudden surge recovery |
| `npm run test:full` | All scenarios sequentially (~37 min) |
| `npm run test:resident` | Resident journey only, 20 VUs, 3 min |
| `npm run test:manager` | Manager journey only, 10 VUs, 3 min |
| `npm run test:queue` | Queue backpressure, 5 VUs, 2 min |

## Test Scenarios & User Journeys

### Resident Journey (40% of mixed traffic)
Login → Profile → View estate → List access codes → Generate code → Notifications → Community posts

### Manager Journey (20% of mixed traffic)
Login → Dashboard → List residents → Access logs → Send notification → Analytics → Plans

### Community Flow (15%)
List posts → Create post → FAQs → Support tickets

### Access Gate Flow (10%)
Create access code → Validate → Log entry → Log exit

### Payment Flow (10%)
Browse plans → Initiate payment → List payments

### Queue Backpressure (5%)
Burst 5 notifications → Check queue stats → Measure drain time

## Performance Thresholds (SLAs)

| Metric | Target |
|--------|--------|
| p95 response time | < 500ms |
| p99 response time | < 1s |
| Error rate | < 1% |
| Auth latency p95 | < 800ms |
| Checks pass rate | > 95% |

## Rate Limiting

The global rate limiter is **skipped in development mode** (`NODE_ENV=development`), so local load tests won't be throttled. The auth-specific limiter (20 req/15 min) still applies — the test suite handles this by authenticating all users once in `setup()` and reusing tokens.

For staging/production tests, use the `.env.loadtest` config which raises session limits.

## Custom Environment Variables

```bash
# Override base URL
k6 run --env BASE_URL=http://staging.lockwise.app/api/v1 tests/full-load-test.js

# Tag environment
k6 run --env ENV=staging tests/full-load-test.js
```

## Output & Reporting

```bash
# JSON output
k6 run --out json=results/output.json tests/full-load-test.js

# InfluxDB + Grafana
k6 run --out influxdb=http://localhost:8086/k6 tests/full-load-test.js

# k6 Cloud
k6 cloud tests/full-load-test.js
```

## Interpreting Results

- **http_req_duration**: End-to-end request time. Watch p95 and p99.
- **http_req_waiting**: Server processing time (excludes network). If this is high, the bottleneck is server-side.
- **errors**: Custom error rate. Spikes here indicate application-level failures.
- **queue_drain_time**: How long queue stats endpoint takes under load. Proxy for Redis/Bull health.
- **429 responses**: Expected during stress/spike. Track separately — if they appear during normal load, rate limits are too aggressive.

## Architecture

```
tests/
├── config.js                  # Shared env, users, thresholds
├── full-load-test.js          # Orchestrator (all scenarios)
├── helpers/
│   ├── auth.js                # Token pool management
│   └── checks.js              # Reusable assertions
└── scenarios/
    ├── resident-journey.js    # Resident user flow
    ├── manager-journey.js     # Manager/admin flow
    ├── access-flow.js         # Gate hardware simulation
    ├── community-flow.js      # Social features
    ├── payment-flow.js        # Payment lifecycle
    ├── queue-backpressure.js  # Bull/Redis stress
    ├── mixed-workload.js      # Weighted random router
    └── *-standalone.js        # Individual runnable versions
```
