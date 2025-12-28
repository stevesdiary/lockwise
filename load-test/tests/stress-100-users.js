import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests under 2s
    http_req_failed: ['rate<0.15'],    // Less than 15% failures
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
  // Mix of different endpoints
  let endpoints = [
    () => {
      let payload = JSON.stringify({
        email: `user${Math.floor(Math.random() * 1000)}@test.com`,
        password: 'TestPass123!'
      });
      return http.post(`${BASE_URL}/auth/login`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
    },
    () => http.get(`${BASE_URL}/legal/terms`),
    () => http.get(`${BASE_URL}/legal/privacy`),
    () => http.get(`${BASE_URL}/home`),
  ];

  let endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  let response = endpoint();
  
  check(response, {
    'status is 2xx/4xx': (r) => r.status >= 200 && r.status < 500,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  sleep(Math.random() * 2);
}