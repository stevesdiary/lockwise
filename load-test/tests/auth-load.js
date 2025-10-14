import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
  // Test login endpoint with random test users
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
    'login endpoint responds': (r) => r.status === 200 || r.status === 400 || r.status === 401 || r.status === 500,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has valid JSON response': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);
}