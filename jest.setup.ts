// Global Jest setup for shared mocks
// Mock next-intl to avoid needing a Provider in tests
 
jest.mock('next-intl', () => ({
  useTranslations: () => (key, options) => {
    if (options && (options.default ?? options.fallback)) {
      return options.default ?? options.fallback;
    }
    return '';
  },
  IntlProvider: ({ children }) => children,
}));
 

