// Global Jest setup for shared mocks
// Mock next-intl to avoid needing a Provider in tests

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, options?: { default?: string; fallback?: string }) => {
    if (options && (options.default ?? options.fallback)) {
      return options.default ?? options.fallback;
    }
    return key; // restituisce la chiave così i test possono cercare testo prevedibile
  },
  useLocale: () => 'it',
  IntlProvider: ({ children }: { children: React.ReactNode }) => children,
}));


