import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000/api/v1';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
    errors: ['rate<0.1'],             // Custom error rate
  },
};

let authToken = '';

export function setup() {
  // Login to get auth token
  const loginRes = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: 'admin@lockwise.com',
    password: 'password123'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  if (loginRes.status === 200) {
    const body = JSON.parse(loginRes.body);
    return { token: body.token };
  }
  return { token: '' };
}

export default function(data) {
  const token = data.token;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Test 1: Dashboard endpoint
  const dashboardRes = http.get(`${BASE_URL}/admin/dashboard`, { headers });
  check(dashboardRes, {
    'dashboard status is 200': (r) => r.status === 200,
    'dashboard response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 2: User list endpoint
  const usersRes = http.get(`${BASE_URL}/users/all`, { headers });
  check(usersRes, {
    'users status is 200': (r) => r.status === 200,
    'users response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  sleep(1);

  // Test 3: Analytics endpoint
  const analyticsRes = http.get(`${BASE_URL}/analytics/dashboard?days=7`, { headers });
  check(analyticsRes, {
    'analytics status is 200': (r) => r.status === 200,
    'analytics response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(2);
}

export function teardown(data) {
  // Cleanup if needed
  console.log('Load test completed');
}