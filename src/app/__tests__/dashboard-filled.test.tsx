import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import DashboardPage from '../dashboard/page';
jest.mock('@/lib/supabaseServer');

describe('DashboardPage - con dati', () => {
  beforeAll(() => {
    window.localStorage.setItem('language', 'it');
    window.localStorage.setItem('country', 'it');
    window.localStorage.setItem('eventType', 'wedding');
  });

  it('mostra dashboard se lingua/nazione/evento sono impostati', () => {
    render(<DashboardPage />);
    // Verifica che almeno una delle intestazioni dashboard sia presente
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
  });
});
