import http from 'k6/http';
import { check } from 'k6';

const BASE = __ENV.BASE_URL || 'http://127.0.0.1:43123';

export const options = {
  scenarios: {
    inside_spam: {
      executor: 'constant-vus',
      vus: 25,
      duration: '12s',
      exec: 'insideSpam',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

export function setup() {
  const health = http.get(`${BASE}/health`);
  if (health.status !== 200) {
    throw new Error(`API is not healthy: ${health.status} ${health.body}`);
  }
  return { userId: `k6-spam-${Date.now()}` };
}

export function insideSpam(data) {
  const res = http.post(
    `${BASE}/locations`,
    JSON.stringify({
      userId: data.userId,
      latitude: 40.995,
      longitude: 29.045,
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
}

export function teardown(data) {
  const res = http.get(`${BASE}/logs?userId=${data.userId}&limit=100`);
  const body = res.json();
  if (body.total !== 1) {
    throw new Error(
      `enter-only failed: expected 1 log for ${data.userId}, got ${body.total}`,
    );
  }
}
