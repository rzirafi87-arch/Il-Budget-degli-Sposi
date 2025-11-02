import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../dashboard/page';

describe('DashboardPage - selezione obbligatoria', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => '',
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('mostra schermata di selezione se lingua/nazione/evento non sono impostati', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Seleziona lingua, nazione ed evento/i)).toBeInTheDocument();
  });
});
