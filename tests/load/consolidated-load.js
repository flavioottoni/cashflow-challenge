/**
 * Load test — Consolidated Service
 * Meta: 50 req/s por 30s com taxa de erro <= 5%
 *
 * Pré-requisitos:
 *   - k6 instalado (https://k6.io/docs/get-started/installation/)
 *   - Stack rodando (docker compose up)
 *
 * Execução:
 *   k6 run tests/load/consolidated-load.js
 *   ou: npm run load-test
 */

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    peak_load: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<500'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const DATE = __ENV.TEST_DATE || '2026-06-29';

export function setup() {
  const tokenRes = http.post(
    `${BASE_URL}/auth/token`,
    JSON.stringify({
      merchantId: 'load-test-merchant',
      username: 'load-tester',
    }),
    { headers: { 'Content-Type': 'application/json' } },
  );

  if (tokenRes.status !== 201 && tokenRes.status !== 200) {
    console.warn('Token request failed, trying without auth against consolidated directly');
    return { token: null, useDirect: true };
  }

  const body = tokenRes.json();
  return { token: body.accessToken, useDirect: false };
}

export default function (data) {
  const headers = {
    'Content-Type': 'application/json',
    ...(data.token ? { Authorization: `Bearer ${data.token}` } : {}),
    'x-merchant-id': 'load-test-merchant',
  };

  const url = data.useDirect
    ? `http://localhost:3002/daily-balance?date=${DATE}`
    : `${BASE_URL}/daily-balance?date=${DATE}`;

  const res = http.get(url, { headers });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has balance field': (r) => {
      try {
        const json = r.json();
        return json.balance !== undefined;
      } catch {
        return false;
      }
    },
  });

  sleep(0.01);
}
