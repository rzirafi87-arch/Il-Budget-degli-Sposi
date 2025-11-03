// Global Jest setup for shared mocks
// Mock next-intl to avoid needing a Provider in tests
/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('next-intl', () => ({
  useTranslations: () => ((_: any, o: any) => (o && (o.default ?? o.fallback) ? (o.default ?? o.fallback) : '')),
  IntlProvider: ({ children }: any) => children,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

