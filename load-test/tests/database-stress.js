import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 300 },
    { duration: '5m', target: 500 },
    { duration: '2m', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
  // Mix of database-heavy operations
  let operations = [
    () => http.get(`${BASE_URL}/estates?page=1&limit=50`),
    () => http.get(`${BASE_URL}/users?search=test&page=1`),
    () => http.get(`${BASE_URL}/access-logs?estate_id=test&limit=100`),
    () => http.get(`${BASE_URL}/analytics/dashboard`),
  ];

  let operation = operations[Math.floor(Math.random() * operations.length)];
  let response = operation();
  
  check(response, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
    'no database errors': (r) => !r.body.includes('database error'),
  });

  sleep(Math.random() * 2);
}