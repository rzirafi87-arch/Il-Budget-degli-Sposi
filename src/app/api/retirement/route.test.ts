import type { NextRequest } from 'next/server';
import { GET, POST } from './route';

// Minimal mocks for NextRequest-like objects (typed as Partial<NextRequest>)
function makeReq(authorizationHeader: string | null, body?: unknown): Partial<NextRequest> {
  return {
    headers: {
      get: (name: string) => {
        if (name.toLowerCase() === 'authorization') return authorizationHeader;
        return null;
      },
    } as Headers,
    json: async () => body,
  };
}

describe('retirement API', () => {
  test('GET unauthenticated returns demo rows', async () => {
    const req = makeReq(null);
    const res = await GET(req as NextRequest);
    const json = await (res as unknown as { json: () => Promise<unknown> }).json();
    const payload = json as { demo?: boolean; rows?: unknown };
    expect(payload.demo).toBe(true);
    expect(Array.isArray(payload.rows)).toBe(true);
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
    const res = await POST(req as NextRequest);
    const json = await (res as unknown as { json: () => Promise<unknown> }).json();
    const payload = json as { error?: unknown };
    expect(payload.error).toBeDefined();
  });
});
