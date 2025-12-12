
import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

export const options = {
  stages: [
    { duration: '30s', target: 500 }, // Ramp to 500 users
    { duration: '1m', target: 500 },  // Stay at 500
    { duration: '10s', target: 0 },   // Scale down
  ],
};

export default function () {
  const url = 'http://localhost:5000/transaction';
  const idempotencyKey = uuidv4();

  const payload = JSON.stringify({
    from: "acc_k6_load_test",
    to: "acc_k6_system",
    amount: 10 + Math.random() * 90,
    type: "transfer",
    description: "Load Test K6"
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'idempotency-key': idempotencyKey,
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'is status 202': (r) => r.status === 202,
    'queue depth > 0': (r) => r.json('status') === 'ACCEPTED',
  });

  sleep(0.1);
}
