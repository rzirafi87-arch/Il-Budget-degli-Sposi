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

function makeReq(pathname: string, cookieMap: Record<string, string> = {}) {
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
  return { nextUrl, cookies } as { nextUrl: URL; cookies: Record<string, unknown> };
}

type MiddlewareResponse = { status: number; headers: Map<string, string> };

describe('middleware redirects onboarding', () => {
  it('redirects to select-language when no cookies', () => {
    const res = middleware(makeReq('/dashboard')) as MiddlewareResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/select-language');
  });

  it('redirects to select-country when language only', () => {
    const res = middleware(makeReq('/dashboard', { language: 'it' })) as MiddlewareResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/select-country');
  });

  it('redirects to select-event-type when language and country only', () => {
    const res = middleware(makeReq('/dashboard', { language: 'it', country: 'it' })) as MiddlewareResponse;
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toContain('/select-event-type');
  });

  it('allows access when all cookies present', () => {
    const res = middleware(makeReq('/dashboard', { language: 'it', country: 'it', eventType: 'wedding' })) as MiddlewareResponse;
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeUndefined();
  });
});
