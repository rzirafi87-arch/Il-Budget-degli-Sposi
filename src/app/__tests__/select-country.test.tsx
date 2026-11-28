import '@testing-library/jest-dom';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

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

import SelectCountryPage from '../[locale]/(routes)/select-country/page';

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

  it('salva paese selezionato in localStorage e cookie e abilita Avanti', async () => {
    render(<SelectCountryPage />);

    const btn = screen.getByText(/^(MX|Messico)$/i);
    fireEvent.click(btn);

    await waitFor(() => {
      expect(window.localStorage.getItem('country')).toBe('mx');
      expect(document.cookie).toMatch(/country=mx/);
    });

    // Dopo selezione compare il pulsante Avanti
    const avanti = screen.getByRole('button', { name: /avanti/i });
    expect(avanti).toBeInTheDocument();

    // Clic non deve lanciare errori, il push è mockato
    fireEvent.click(avanti);
  });
  it('filtra per nome e codice senza perdere la selezione', async () => {
    render(<SelectCountryPage />);
    await act(async () => { fireEvent.click(screen.getByText(/^(MX|Messico)$/i)); });
    const search = screen.getByRole('searchbox', { name: /cerca una nazione/i });
    fireEvent.change(search, { target: { value: 'fr' } });
    expect(screen.getByRole('button', { name: /francia/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /messico/i })).not.toBeInTheDocument();
    expect(localStorage.getItem('country')).toBe('mx');
    fireEvent.change(search, { target: { value: 'nessuna corrispondenza' } });
    expect(screen.getByRole('status')).toHaveTextContent('Nessuna nazione trovata');
    fireEvent.change(search, { target: { value: '' } });
    expect(screen.getByRole('button', { name: /messico/i })).toHaveAttribute('aria-pressed', 'true');
  });

});
