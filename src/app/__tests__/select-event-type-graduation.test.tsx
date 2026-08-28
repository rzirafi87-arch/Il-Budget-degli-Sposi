import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock next/navigation router to avoid real navigation in jsdom
const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));
jest.mock("@/lib/supabaseBrowser", () => ({
  getBrowserClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: "token" } }, error: null }) } }),
}));

// Simple fetch mock for the traditions preview
beforeAll(() => {
  // @ts-expect-error - Mocking global fetch for testing
  global.fetch = jest.fn((input) =>
    Promise.resolve({ ok: true, json: () => Promise.resolve(String(input).includes("traditions") ? { traditions: [] } : { ok: true }) })
  );
});

import SelectEventTypePage from '../[locale]/(routes)/select-event-type/page';

describe('SelectEventTypePage - Laurea', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.cookie = '';
    mockPush.mockClear();
  });

  it('mostra Laurea e salva la scelta, reindirizzando alla Dashboard', async () => {
    // Imposta lingua e paese per evitare redirect iniziali
    window.localStorage.setItem('language', 'it');
    window.localStorage.setItem('country', 'it');

    render(<SelectEventTypePage />);

    const btn = screen.getByRole('button', { name: /laurea/i });
    fireEvent.click(btn);

    expect(window.localStorage.getItem('eventType')).toBe('graduation');
    expect(document.cookie).toMatch(/eventType=graduation/);
    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/it/dashboard'));
  });
});
