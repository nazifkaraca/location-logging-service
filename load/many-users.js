import http from 'k6/http';
import { check } from 'k6';

const BASE = __ENV.BASE_URL || 'http://127.0.0.1:43123';

export const options = {
  scenarios: {
    first_enter: {
      executor: 'constant-arrival-rate',
      rate: 40,
      timeUnit: '1s',
      duration: '10s',
      preAllocatedVUs: 40,
      exec: 'firstEnter',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

export function firstEnter() {
  const userId = `k6-user-${__VU}-${__ITER}`;
  const res = http.post(
    `${BASE}/locations`,
    JSON.stringify({
      userId,
      latitude: 40.995,
      longitude: 29.045,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(res, {
    'status is 200': (r) => r.status === 200,
    'logged enter': (r) => {
      const body = r.json();
      return Array.isArray(body.enteredAreaIds) && body.enteredAreaIds.length >= 1;
    },
  });
}
