// Global Jest setup for shared mocks
// Mock next-intl to avoid needing a Provider in tests
jest.mock('next-intl', () => ({
  useTranslations: () => ((_, o) => (o && (o.default ?? o.fallback) ? (o.default ?? o.fallback) : '')),
  IntlProvider: ({ children }) => children,
}));
