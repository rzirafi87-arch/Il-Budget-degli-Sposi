// Mock next/server to avoid edge runtime globals in Jest
jest.mock('next/server', () => {
  const next = () => ({ status: 200, headers: new Map<string, string>() });
  const redirect = (url: string | URL) => {
    const location = typeof url === 'string' ? url : url.toString();
    return { status: 307, headers: new Map<string, string>([["location", location]]) };
  };
  return { NextResponse: { next, redirect } };
});

import { middleware } from '../../../middleware';

// Minimal shape mock per soddisfare il middleware senza dipendere da Next internals
type MockNextRequest = { nextUrl: URL & { clone: () => URL }; cookies: { get: (name: string) => { value: string } | undefined } };

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
  return { nextUrl, cookies } as MockNextRequest;
}

type MiddlewareResponse = { status: number; headers: Map<string, string> };

describe('middleware redirects onboarding', () => {
  it('redirects to select-language when no cookies', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = middleware(makeReq('/dashboard') as unknown as any) as MiddlewareResponse; // cast per firma NextRequest
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/select-language');
  });

  it('redirects to select-country when language only', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = middleware(makeReq('/dashboard', { language: 'it' }) as unknown as any) as MiddlewareResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/select-country');
  });

  it('redirects to select-event-type when language and country only', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = middleware(makeReq('/dashboard', { language: 'it', country: 'it' }) as unknown as any) as MiddlewareResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/select-event-type');
  });

  it('redirects to locale dashboard when all cookies present and no locale prefix', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const res = middleware(makeReq('/dashboard', { language: 'it', country: 'it', eventType: 'wedding' }) as unknown as any) as MiddlewareResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/it/dashboard');
  });
});
