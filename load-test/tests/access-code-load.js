import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '2m', target: 200 },
    { duration: '1m', target: 0 },
  ],
};

const BASE_URL = 'http://localhost:3000/api/v1';

export default function () {
  // ORIGINAL CODE - Commented out for testing
  // let payload = JSON.stringify({
  //   user_id: `user-${Math.floor(Math.random() * 1000)}`,
  //   estate_id: `estate-${Math.floor(Math.random() * 10)}`,
  //   access_code: Math.floor(Math.random() * 900000) + 100000,
  //   date_in: new Date().toISOString(),
  //   date_out: new Date(Date.now() + 24*60*60*1000).toISOString(),
  //   access_type: 'guest',
  //   status: 'pending',
  //   resident_id: `resident-${Math.floor(Math.random() * 100)}`,
  //   created_by: `admin-${Math.floor(Math.random() * 5)}`
  // });
  // let response = http.post(`${BASE_URL}/access-codes`, payload, params);

  // Test custom access code generation (no auth required)
  let payload = JSON.stringify({
    eventName: `Event-${Math.floor(Math.random() * 1000)}`
  });

  let params = {
    headers: {
      'Content-Type': 'application/json'
    },
  };

  let response = http.post(`${BASE_URL}/access-codes/custom`, payload, params);
  
  // Log errors for debugging
  if (response.status !== 200) {
    console.log(`Error ${response.status}: ${response.body}`);
  }
  
  check(response, {
    'access code creation status': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  sleep(0.5);
}