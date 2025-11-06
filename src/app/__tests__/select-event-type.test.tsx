import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock next/navigation router to avoid real navigation in jsdom
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

// Simple fetch mock for the traditions preview
beforeAll(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ traditions: [] }) })
  ) as unknown as typeof fetch;
});

import SelectEventTypePage from '../select-event-type/page';

describe('SelectEventTypePage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  (document as unknown as { cookie: string }).cookie = '';
  });

  it('mostra i tipi di evento e salva la scelta', () => {
    // Imposta lingua e paese per evitare redirect iniziali
    window.localStorage.setItem('language', 'it');
    window.localStorage.setItem('country', 'it');

    render(<SelectEventTypePage />);

    // Usa fallback se mancano traduzioni (es. "wedding")
    const btn = screen.getByRole('button', { name: /^(Matrimonio|wedding)$/i });
    fireEvent.click(btn);

    expect(window.localStorage.getItem('eventType')).toBe('wedding');
    expect(document.cookie).toMatch(/eventType=wedding/);
  });
});
