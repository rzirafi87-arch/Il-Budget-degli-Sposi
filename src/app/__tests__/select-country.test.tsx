import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

// Mock next/navigation for useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Simple fetch mock for the traditions preview
beforeAll(() => {
  // @ts-ignore
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ traditions: [] }) })
  ) as any;
});

import SelectCountryPage from '../select-country/page';

describe('SelectCountryPage', () => {
  beforeEach(() => {
    // Reset storage and cookies before each test
    window.localStorage.clear();
    // Reset cookies by overwriting with empty string
    // jsdom allows setting document.cookie to clear; not a full clear, but fine for test isolation
    (document as any).cookie = '';
  });

  it('mostra i paesi e consente la selezione', () => {
    render(<SelectCountryPage />);

    // Trova alcuni paesi noti (usa fallback in assenza di traduzioni)
    expect(screen.getByText(/IT|Italia/i)).toBeInTheDocument();
    expect(screen.getByText(/MX|Messico/i)).toBeInTheDocument();
  });

  it('salva paese selezionato in localStorage e cookie e abilita Avanti', () => {
    render(<SelectCountryPage />);

    const btn = screen.getByText(/MX|Messico/i);
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
