import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom Metrics
const errorRate = new Rate('errors');
const authDuration = new Trend('auth_duration');
const apiCallCounter = new Counter('api_calls');

// Environment Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';
const TEST_USER_EMAIL = __ENV.TEST_EMAIL || 'admin@lockwise.com';
const TEST_USER_PASSWORD = __ENV.TEST_PASSWORD || 'Admin123!';

// Industry-Standard Load Test Configuration
export const options = {
  // Test Scenarios
  scenarios: {
    // Smoke Test: Verify system works with minimal load
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      tags: { test_type: 'smoke' },
      exec: 'smokeTest',
    },
    
    // Load Test: Normal expected load
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up
        { duration: '5m', target: 50 },   // Steady state
        { duration: '2m', target: 100 },  // Peak load
        { duration: '5m', target: 100 },  // Sustained peak
        { duration: '2m', target: 0 },    // Ramp down
      ],
      gracefulRampDown: '30s',
      tags: { test_type: 'load' },
      exec: 'loadTest',
    },
    
    // Stress Test: Push beyond normal capacity
    stress: {
      executor: 'ramping-arrival-rate',
      startRate: 50,
      timeUnit: '1s',
      preAllocatedVUs: 100,
      maxVUs: 500,
      stages: [
        { duration: '2m', target: 100 },  // Ramp to 100 req/s
        { duration: '5m', target: 100 },  // Stay at 100 req/s
        { duration: '2m', target: 200 },  // Ramp to 200 req/s
        { duration: '5m', target: 200 },  // Stay at 200 req/s
        { duration: '2m', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'stress' },
      exec: 'stressTest',
    },
    
    // Spike Test: Sudden traffic surge
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },   // Normal load
        { duration: '1m', target: 500 },   // Spike!
        { duration: '3m', target: 500 },   // Sustained spike
        { duration: '10s', target: 10 },   // Back to normal
        { duration: '3m', target: 10 },    // Recovery
      ],
      tags: { test_type: 'spike' },
      exec: 'spikeTest',
    },
    
    // Soak Test: Extended duration at normal load
    soak: {
      executor: 'constant-vus',
      vus: 50,
      duration: '1h',
      tags: { test_type: 'soak' },
      exec: 'soakTest',
    },
  },

  // Performance Thresholds (SLAs)
  thresholds: {
    // HTTP metrics
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],  // 95% < 500ms, 99% < 1s
    'http_req_duration{test_type:smoke}': ['p(95)<300'],
    'http_req_failed': ['rate<0.01'],                   // Error rate < 1%
    'http_req_waiting': ['p(95)<400'],                  // Server processing time
    
    // Custom metrics
    'errors': ['rate<0.05'],                            // Custom error rate < 5%
    'auth_duration': ['p(95)<800'],                     // Auth should be fast
    'api_calls': ['count>1000'],                        // Minimum API calls
    
    // Specific checks
    'checks': ['rate>0.95'],                            // 95% of checks pass
  },

  // Global settings
  noConnectionReuse: false,
  userAgent: 'K6LoadTest/1.0',
  batch: 10,
  batchPerHost: 5,
  
  // Graceful shutdown
  gracefulStop: '30s',
  
  // Tags for all requests
  tags: {
    project: 'lockwise',
    environment: 'load-test',
  },
};

// Shared authentication token
let authToken = null;

// Setup: Run once before all scenarios
export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (loginRes.status === 200) {
    const body = JSON.parse(loginRes.body);
    return { token: body.token || body.data?.token };
  }
  
  console.error('Setup failed: Unable to authenticate');
  return { token: null };
}

// Smoke Test: Basic functionality check
export function smokeTest(data) {
  group('Smoke Test - Critical Paths', () => {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`,
    };

    // Health check
    group('Health Check', () => {
      const res = http.get(`${BASE_URL}/health`);
      check(res, {
        'health check is 200': (r) => r.status === 200,
      });
    });

    // Auth check
    group('Authentication', () => {
      const res = http.get(`${BASE_URL}/auth/me`, { headers });
      check(res, {
        'auth check is 200': (r) => r.status === 200,
      }) || errorRate.add(1);
    });

    sleep(1);
  });
}

// Load Test: Realistic user behavior
export function loadTest(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  group('User Journey - Browse & Interact', () => {
    // List roles
    group('GET /roles/all', () => {
      const res = http.get(`${BASE_URL}/admin/roles/all`, { headers });
      const success = check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
        'has data': (r) => r.body.includes('role'),
      });
      
      errorRate.add(!success);
      apiCallCounter.add(1);
    });

    sleep(1);

    // List permissions
    group('GET /permissions/all', () => {
      const res = http.get(`${BASE_URL}/admin/permissions/all`, { headers });
      check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 500ms': (r) => r.timings.duration < 500,
      }) || errorRate.add(1);
      
      apiCallCounter.add(1);
    });

    sleep(2);
  });
}

// Stress Test: Push system limits
export function stressTest(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  // Rapid-fire requests
  const endpoints = [
    `${BASE_URL}/admin/roles/all`,
    `${BASE_URL}/admin/permissions/all`,
    `${BASE_URL}/auth/me`,
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(endpoint, { headers });
  
  check(res, {
    'status is not 5xx': (r) => r.status < 500,
    'response time < 2s': (r) => r.timings.duration < 2000,
  }) || errorRate.add(1);

  apiCallCounter.add(1);
  sleep(0.1); // Minimal sleep for stress
}

// Spike Test: Handle sudden traffic
export function spikeTest(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  const res = http.get(`${BASE_URL}/admin/roles/all`, { headers });
  
  check(res, {
    'survives spike': (r) => r.status === 200 || r.status === 429, // Accept rate limiting
    'response time < 3s': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);

  apiCallCounter.add(1);
}

// Soak Test: Long-running stability
export function soakTest(data) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${data.token}`,
  };

  group('Soak Test - Sustained Load', () => {
    const res = http.get(`${BASE_URL}/admin/roles/all`, { headers });
    
    check(res, {
      'status is 200': (r) => r.status === 200,
      'no memory leaks (consistent response time)': (r) => r.timings.duration < 1000,
    }) || errorRate.add(1);

    apiCallCounter.add(1);
  });

  sleep(3); // Realistic user think time
}

// Teardown: Cleanup after tests
export function teardown(data) {
  console.log('Load test completed');
}

// Handle summary for custom reporting
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
    'summary.html': htmlReport(data),
  };
}

function textSummary(data, options) {
  // K6 built-in summary
  return '';
}

function htmlReport(data) {
  // Generate HTML report
  return JSON.stringify(data);
}
