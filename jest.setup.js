// Global Jest setup for shared mocks (JS only to avoid Babel parser issues)

jest.mock('next-intl', () => ({
  useTranslations: () => (key, options) => {
    if (options && (options.default ?? options.fallback)) {
      return options.default ?? options.fallback;
    }
    return '';
  },
  IntlProvider: ({ children }) => children,
}));

// Minimal global mock for next/server to avoid importing Next's runtime in tests
jest.mock('next/server', () => {
  const nextResponse = {
    json: (body, init) => ({ json: async () => body, status: (init && init.status) || 200 }),
    redirect: (url, status = 302) => ({ headers: { get: (n) => (n.toLowerCase() === 'location' ? url : null) }, status }),
    next: () => ({ cookies: { set: jest.fn() } }),
  };
  return {
    NextResponse: nextResponse,
    NextRequest: class {},
  };
});
