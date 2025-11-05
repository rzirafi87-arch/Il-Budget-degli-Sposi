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
