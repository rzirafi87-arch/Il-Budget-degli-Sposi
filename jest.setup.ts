// Global Jest setup for shared mocks
// Mock next-intl to avoid needing a Provider in tests
/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('next-intl', () => ({
  useTranslations: () => (key: any, options?: any) => {
    if (options && (options.default ?? options.fallback)) {
      return options.default ?? options.fallback;
    }
    return '';
  },
  IntlProvider: ({ children }: any) => children,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

