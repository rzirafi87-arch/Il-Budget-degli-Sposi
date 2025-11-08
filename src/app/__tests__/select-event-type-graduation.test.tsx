import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock next/navigation router to avoid real navigation in jsdom
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
}));

// Simple fetch mock for the traditions preview
beforeAll(() => {
  // @ts-expect-error - Mocking global fetch for testing
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ traditions: [] }) })
  );
});

import SelectEventTypePage from '../[locale]/(routes)/select-event-type/page';

describe('SelectEventTypePage - Laurea', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = '';
    mockPush.mockClear();
  });

  it('mostra Laurea e salva la scelta, reindirizzando alla Dashboard', () => {
    // Imposta lingua e paese per evitare redirect iniziali
    window.localStorage.setItem('language', 'it');
    window.localStorage.setItem('country', 'it');

    render(<SelectEventTypePage />);

    const btn = screen.getByRole('button', { name: /laurea/i });
    fireEvent.click(btn);

    expect(window.localStorage.getItem('eventType')).toBe('graduation');
    expect(document.cookie).toMatch(/eventType=graduation/);
  expect(mockPush).toHaveBeenCalledWith('/it/dashboard');
  });
});
