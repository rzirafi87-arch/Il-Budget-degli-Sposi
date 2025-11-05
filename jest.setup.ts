// Global Jest setup for shared mocks
// Mock next-intl to avoid needing a Provider in tests
/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('next-intl', () => ({
  useTranslations: () => {
    return (_: any, o: any) => {
      if (o && (o.default ?? o.fallback)) {
        return o.default ?? o.fallback;
      }
      return '';
    };
  },
  IntlProvider: ({ children }: any) => children,
}));
/* eslint-enable @typescript-eslint/no-explicit-any */

