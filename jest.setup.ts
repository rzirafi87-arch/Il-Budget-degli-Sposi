import type { ReactNode } from 'react';
// Global Jest setup for shared mocks
// Mock next-intl to avoid needing a Provider in tests
jest.mock('next-intl', () => ({
  useTranslations: () => ((_: string, o?: { default?: string; fallback?: string }) => (o?.default ?? o?.fallback ?? '')),
  IntlProvider: ({ children }: { children?: ReactNode }) => children,
}));
