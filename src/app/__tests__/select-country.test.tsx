import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock next/navigation for useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Simple fetch mock for the traditions preview
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ traditions: [] }) })
  ) as unknown as typeof fetch;
});

import SelectCountryPage from '../select-country/page';

describe('SelectCountryPage', () => {
  beforeEach(() => {
    // Reset storage and cookies before each test
    window.localStorage.clear();
    // Reset cookies by overwriting with empty string
    // jsdom allows setting document.cookie to clear; not a full clear, but fine for test isolation
  (document as unknown as { cookie: string }).cookie = '';
  });

  it('mostra i paesi e consente la selezione', () => {
    render(<SelectCountryPage />);

    // Trova alcuni paesi noti (usa fallback in assenza di traduzioni)
    expect(screen.queryAllByText(/^(IT|Italia)$/i).length).toBeGreaterThan(0);
    expect(screen.queryAllByText(/^(MX|Messico)$/i).length).toBeGreaterThan(0);
  });

  it('salva paese selezionato in localStorage e cookie e abilita Avanti', () => {
    render(<SelectCountryPage />);

    const btn = screen.getByText(/^(MX|Messico)$/i);
    fireEvent.click(btn);

    expect(window.localStorage.getItem('country')).toBe('mx');
    expect(document.cookie).toMatch(/country=mx/);

    // Dopo selezione compare il pulsante Avanti
    const avanti = screen.getByRole('button', { name: /avanti/i });
    expect(avanti).toBeInTheDocument();

    // Clic non deve lanciare errori, il push è mockato
    fireEvent.click(avanti);
  });
});
