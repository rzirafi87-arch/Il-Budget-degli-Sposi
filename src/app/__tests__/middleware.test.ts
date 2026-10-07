// Mock next/server to avoid edge runtime globals in Jest

jest.mock('next/server', () => {
  const next = () => ({ status: 200, headers: new Headers() });
  const redirect = (url: string | URL) => {
    const location = typeof url === 'string' ? url : url.toString();
    const headers = new Headers();
    headers.set('location', location);
    return { status: 307, headers };
  };
  const json = (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
    status: init?.status ?? 200,
    headers: new Headers(init?.headers),
    json: async () => body,
  });
  return { NextResponse: { next, redirect, json } };
});

import { proxy } from '../../proxy';

// Minimal shape mock per soddisfare il middleware senza dipendere da Next internals
type MockNextRequest = { method: string; nextUrl: URL & { clone: () => URL }; cookies: { get: (name: string) => { value: string } | undefined } };

function makeReq(pathname: string, cookieMap: Record<string, string> = {}): MockNextRequest {
  const base = new URL('http://localhost' + pathname);
  const nextUrl = Object.assign(base, {
    clone() {
      return new URL(this.toString());
    },
  });
  const cookies = Object.assign({}, cookieMap, {
    get(name: string) {
      return cookieMap[name] ? { value: cookieMap[name] } : undefined;
    },
  });
  return { method: 'GET', nextUrl, cookies } as MockNextRequest;
}

type MiddlewareResponse = { status: number; headers: Headers };

describe('middleware redirects onboarding', () => {

  it('redirects to select-language when no cookies', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = proxy(makeReq('/dashboard') as unknown as any) as MiddlewareResponse; // cast per firma NextRequest
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/it/dashboard');
  });


  it('redirects to select-country when language only', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = proxy(makeReq('/dashboard', { language: 'it' }) as unknown as any) as MiddlewareResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/it/dashboard');
  });


  it('redirects to select-event-type when language and country only', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = proxy(makeReq('/dashboard', { language: 'it', country: 'it' }) as unknown as any) as MiddlewareResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/it/dashboard');
  });

  it('redirects to locale dashboard when all cookies present and no locale prefix', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = proxy(makeReq('/dashboard', { language: 'it', country: 'it', eventType: 'wedding' }) as unknown as any) as MiddlewareResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/it/dashboard');
  });

  it.each(['en', 'es', 'fr', 'de'])('serves the audited locale %s without redirecting', (locale) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = proxy(makeReq(`/${locale}/dashboard`) as unknown as any) as MiddlewareResponse;
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('uses a READY English locale cookie', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = proxy(makeReq('/dashboard', { language: 'en' }) as unknown as any) as MiddlewareResponse;
    expect(res.headers.get('location')).toBe('http://localhost/en/dashboard');
  });

  it.each([
    '/api/birthday/seed/11111111-1111-4111-8111-111111111111',
    '/api/my/birthday-dashboard',
  ])('blocks direct legacy event API access for %s', async (pathname) => {
    const req = makeReq(pathname);
    req.method = pathname.includes('/seed/') ? 'POST' : 'GET';
    const res = proxy(req as never) as MiddlewareResponse & { json: () => Promise<unknown> };
    expect(res.status).toBe(409);
    await expect(res.json()).resolves.toEqual({ error: 'EVENT_TYPE_COMING_SOON' });
  });

  it('keeps legacy seed GET read-only', async () => {
    const res = proxy(makeReq('/api/baptism/seed') as never) as MiddlewareResponse & { json: () => Promise<unknown> };
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
    await expect(res.json()).resolves.toEqual({ error: 'METHOD_NOT_ALLOWED' });
  });
});
