import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// Simple fetch mock for the traditions preview used in CresimaPage
beforeAll(() => {
  // @ts-expect-error - Mocking global fetch for testing
  global.fetch = jest.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ traditions: [] }) })
  );
});

import CresimaPage from '../[locale]/(routes)/cresima/page';

describe('CresimaPage', () => {
  it('renderizza la Panoramica e la navigazione', () => {
    render(<CresimaPage />);
    // Verifica che ci siano i link principali nella navigazione
    const links = screen.getAllByRole('link');
    const linkTexts = links.map(link => link.textContent);

    expect(linkTexts).toContain('Panoramica');
    expect(linkTexts).toContain('Timeline');
    expect(linkTexts).toContain('Idea di budget');
    expect(linkTexts).toContain('Invitati');
    expect(linkTexts).toContain('Budget');
  });
});
