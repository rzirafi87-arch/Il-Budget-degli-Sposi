import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import DashboardPage from '../dashboard/page';

describe('DashboardPage', () => {
  afterEach(() => {
    // Ripristina localStorage dopo ogni test
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => '',
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('mostra schermata di selezione se lingua/nazione/evento non sono impostati', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => '',
        setItem: jest.fn(),
      },
      writable: true,
    });
    render(<DashboardPage />);
    expect(screen.getByText(/Seleziona lingua, nazione ed evento/i)).toBeInTheDocument();
  });

  it('mostra dashboard se lingua/nazione/evento sono impostati', () => {
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => {
          if (key === 'language') return 'it';
          if (key === 'country') return 'it';
          if (key === 'eventType') return 'wedding';
          return '';
        },
        setItem: jest.fn(),
      },
      writable: true,
    });
    render(<DashboardPage />);
  expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0);
  });
});
