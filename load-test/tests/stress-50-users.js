import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests under 1s
    http_req_failed: ['rate<0.1'],     // Less than 10% failures
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
  let loginPayload = JSON.stringify({
    email: `user${Math.floor(Math.random() * 1000)}@test.com`,
    password: 'TestPass123!'
  });

  let params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  let response = http.post(`${BASE_URL}/auth/login`, loginPayload, params);
  
  check(response, {
    'status is 200/400/401': (r) => [200, 400, 401].includes(r.status),
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}