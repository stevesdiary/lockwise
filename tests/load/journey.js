/**
 * Lockwise Full Journey Load Test
 *
 * Stages:
 *   baseline  — gentle ramp 1→50 VUs over 2min, hold 3min
 *   stress    — ramp 50→300 VUs over 5min, hold 5min, ramp down
 *   spike     — sudden burst to 500 VUs for 1min, drop back
 *
 * Usage:
 *   k6 run -e STAGE=baseline tests/load/journey.js
 *   k6 run -e STAGE=stress   tests/load/journey.js
 *   k6 run -e STAGE=spike    tests/load/journey.js
 *   k6 run                   tests/load/journey.js   # all stages
 *
 * Required env vars:
 *   RESIDENT_EMAIL / RESIDENT_PASSWORD  — resident account credentials
 *   SECURITY_EMAIL / SECURITY_PASSWORD  — security account credentials
 *   ESTATE_CODE   — estate code (e.g. EST005); UUID resolved automatically in setup
 *   BASE_URL      — defaults to http://localhost:3002/api/v1
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ── Custom metrics ───────────────────────────────────────────────────────────
const errorRate        = new Rate('errors');
const estateDuration   = new Trend('estate_read_duration',      true);
const createDuration   = new Trend('access_create_duration',    true);
const validateDuration = new Trend('access_validate_duration',  true);

// ── Config ───────────────────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002/api/v1';
const STAGE    = __ENV.STAGE   || 'all';

const STAGES = {
  baseline: [
    { duration: '1m', target: 10  },
    { duration: '1m', target: 50  },
    { duration: '3m', target: 50  },
    { duration: '1m', target: 0   },
  ],
  stress: [
    { duration: '2m', target: 50  },
    { duration: '5m', target: 300 },
    { duration: '5m', target: 300 },
    { duration: '2m', target: 0   },
  ],
  spike: [
    { duration: '30s', target: 10  },
    { duration: '10s', target: 500 },
    { duration: '1m',  target: 500 },
    { duration: '30s', target: 10  },
    { duration: '30s', target: 0   },
  ],
  all: [
    { duration: '1m',  target: 10  },
    { duration: '1m',  target: 50  },
    { duration: '3m',  target: 50  },
    { duration: '5m',  target: 300 },
    { duration: '5m',  target: 300 },
    { duration: '2m',  target: 50  },
    { duration: '10s', target: 500 },
    { duration: '1m',  target: 500 },
    { duration: '30s', target: 0   },
  ],
};

export const options = {
  stages: STAGES[STAGE] || STAGES.all,
  thresholds: {
    errors:                   [{ threshold: 'rate<0.01', abortOnFail: false }],
    estate_read_duration:     ['p(95)<300'],
    access_create_duration:   ['p(95)<600'],
    access_validate_duration: ['p(95)<400'],
    http_req_failed:          ['rate<0.01'],
    http_req_duration:        ['p(95)<1000'],
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function jsonHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function loginAs(email, password) {
  const res = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email, password }),
    { headers: jsonHeaders() }
  );
  if (res.status !== 200) {
    console.error(`❌ Login failed for ${email}: HTTP ${res.status} — ${res.body.substring(0, 200)}`);
    return null;
  }
  try {
    const body = res.json();
    const token = body?.data?.token || body?.token || null;
    if (!token) console.error(`❌ No token in login response for ${email}: ${res.body.substring(0, 200)}`);
    return token;
  } catch (e) {
    console.error(`❌ Could not parse login response for ${email}: ${res.body.substring(0, 200)}`);
    return null;
  }
}

// ── Setup: runs once, result shared across all VUs ───────────────────────────
export function setup() {
  const estateCode       = __ENV.ESTATE_CODE       || 'EST005';
  const residentEmail    = __ENV.RESIDENT_EMAIL    || 'resident@test.com';
  const residentPassword = __ENV.RESIDENT_PASSWORD || 'Test@1234';
  const securityEmail    = __ENV.SECURITY_EMAIL    || `security@${estateCode.toLowerCase()}.lockwise.local`;
  const securityPassword = __ENV.SECURITY_PASSWORD || 'Security@1234';

  // Resolve estate UUID from estate code
  const estateRes = http.get(
    `${BASE_URL}/estate/code/${estateCode}`,
    { headers: jsonHeaders() }
  );
  let estateId = null;
  if (estateRes.status === 200) {
    try {
      const body = estateRes.json();
      estateId = body?.data?.estate_id || body?.data?.id || null;
      console.log(`✅ Estate resolved: ${estateCode} → ${estateId}`);
    } catch {
      console.error(`❌ Could not parse estate response: ${estateRes.body.substring(0, 200)}`);
    }
  } else {
    console.error(`❌ Estate lookup failed for code "${estateCode}": HTTP ${estateRes.status} — ${estateRes.body.substring(0, 200)}`);
  }

  // Log in both test users
  const residentToken = loginAs(residentEmail, residentPassword);
  const securityToken = loginAs(securityEmail, securityPassword);

  // Smoke-test: verify create access works before unleashing VUs
  if (residentToken) {
    const smokeRes = http.post(
      `${BASE_URL}/access/`,
      JSON.stringify({ access_type: 'visitor', valid_until: new Date(Date.now() + 3600000).toISOString() }),
      { headers: jsonHeaders(residentToken) }
    );
    if (smokeRes.status === 201 || smokeRes.status === 200) {
      console.log(`✅ Smoke test: access create OK (HTTP ${smokeRes.status})`);
    } else {
      console.error(`❌ Smoke test: access create FAILED (HTTP ${smokeRes.status}) — ${smokeRes.body.substring(0, 300)}`);
      console.error(`   Check that ${residentEmail} has joined an estate (estate_id set in their account).`);
    }
  }

  return { residentToken, securityToken, estateId };
}

// ── Main VU function ─────────────────────────────────────────────────────────
export default function (data) {
  const { residentToken, securityToken, estateId } = data;

  // Step 1: Estate read
  if (estateId) {
    group('estate_read', () => {
      const res = http.get(
        `${BASE_URL}/estate/one/${estateId}`,
        { headers: jsonHeaders(residentToken), tags: { endpoint: 'estate_read' } }
      );
      estateDuration.add(res.timings.duration);
      const ok = check(res, {
        'estate read 200': (r) => r.status === 200,
        'estate has id':   (r) => { try { const b = r.json(); return !!(b?.data?.estate_id || b?.data?.id); } catch { return false; } },
      });
      if (!ok) errorRate.add(1);
    });
  }

  sleep(0.2);

  // Step 2: Create access record
  let accessCode = null;

  group('access_create', () => {
    const res = http.post(
      `${BASE_URL}/access/`,
      JSON.stringify({
        access_type: 'visitor',
        valid_until: new Date(Date.now() + 3600000).toISOString(),
      }),
      { headers: jsonHeaders(residentToken), tags: { endpoint: 'access_create' } }
    );
    createDuration.add(res.timings.duration);
    const ok = check(res, {
      'access created 201': (r) => r.status === 201 || r.status === 200,
    });
    if (ok) {
      try {
        const body = res.json();
        accessCode = body?.data?.access_code || null;
      } catch { /* ignore */ }
    } else {
      errorRate.add(1);
    }
  });

  sleep(0.3);

  // Step 3: Validate the generated code (as security user)
  if (accessCode) {
    group('access_validate', () => {
      const res = http.post(
        `${BASE_URL}/access-codes/validate`,
        JSON.stringify({ code: accessCode }),
        { headers: jsonHeaders(securityToken), tags: { endpoint: 'access_validate' } }
      );
      validateDuration.add(res.timings.duration);
      const ok = check(res, {
        'validate 200':     (r) => r.status === 200,
        'validate success': (r) => { try { return r.json()?.success === true; } catch { return false; } },
      });
      if (!ok) errorRate.add(1);
    });
  }

  sleep(0.5);
}
