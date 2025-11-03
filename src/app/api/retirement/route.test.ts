import { GET, POST } from './route';

// Minimal mocks for NextRequest-like objects
function makeReq(headersGet: (() => string | null) | null, body?: any) {
  return {
    headers: {
      get: headersGet ?? (() => null),
    },
    json: async () => body,
  } as any;
}

describe('retirement API', () => {
  test('GET unauthenticated returns demo rows', async () => {
    const req = makeReq(() => null);
    const res = await GET(req as any);
    const json = await (res as any).json();
    expect(json).toHaveProperty('demo', true);
    expect(Array.isArray(json.rows)).toBe(true);
    expect(json.rows.length).toBeGreaterThan(0);
  });

  test('POST without token returns 401', async () => {
    const req = makeReq(() => null, {});
    const res = await POST(req as any);
    const json = await (res as any).json();
    expect((res as any).status).toBe(401);
    expect(json).toHaveProperty('error');
  });
});
