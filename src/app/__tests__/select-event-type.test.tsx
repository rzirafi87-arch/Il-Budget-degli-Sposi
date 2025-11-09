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

import SelectEventTypePage from '../[locale]/(routes)/select-event-type/page';

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

  // Seleziona il primo bottone che contiene "Matrimonio" nel nome
  const btns = screen.getAllByRole('button', { name: /Matrimonio/i });
  fireEvent.click(btns[0]);

  expect(window.localStorage.getItem('eventType')).toBe('wedding');
  expect(document.cookie).toMatch(/eventType=wedding/);
  });
});
