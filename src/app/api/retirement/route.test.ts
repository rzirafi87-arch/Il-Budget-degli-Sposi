import { GET, POST } from './route';

// Minimal mocks for NextRequest-like objects
/* eslint-disable @typescript-eslint/no-explicit-any */
function makeReq(authorizationHeader: any, body?: any): any {
  return {
    headers: {
      get: (name: any) => {
        if (name.toLowerCase() === 'authorization') return authorizationHeader;
        return null;
      },
    },
    json: async () => body,
  };
}

describe('retirement API', () => {
  test('GET unauthenticated returns demo rows', async () => {
  const req = makeReq(null);
  const res = await GET(req);
  const json = await res.json();
  const payload = json;
  expect(payload && payload.demo).toBe(true);
  expect(Array.isArray(payload && payload.rows)).toBe(true);
    // rows should have at least one item in demo
    if (Array.isArray(payload.rows)) {
      expect(payload.rows.length).toBeGreaterThan(0);
    } else {
      // fail softly if structure changed
      expect(Array.isArray(payload.rows)).toBe(true);
    }
  });

  test('POST without token returns error payload', async () => {
  const req = makeReq(null, {});
  const res = await POST(req);
  const json = await res.json();
  const payload = json;
  expect(payload && payload.error).toBeDefined();
  });
});
/* eslint-enable @typescript-eslint/no-explicit-any */
