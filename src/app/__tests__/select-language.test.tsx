import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import SelectLanguagePage from '../[locale]/(routes)/select-language/page';

// Mock next/navigation for useRouter to avoid jsdom navigation errors
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

describe('SelectLanguagePage', () => {
  it('mostra le lingue disponibili', () => {
    render(<SelectLanguagePage />);
    expect(screen.getByText(/Italiano/i)).toBeInTheDocument();
    expect(screen.getByText(/English/i)).toBeInTheDocument();
  expect(screen.getByText(/Español/i)).toBeInTheDocument();
  });

  it('seleziona una lingua e salva in localStorage', () => {
    render(<SelectLanguagePage />);
    const btn = screen.getByText(/Italiano/i);
    fireEvent.click(btn);
    expect(window.localStorage.getItem('language')).toBe('it');
  });
});
