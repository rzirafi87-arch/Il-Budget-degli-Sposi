import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';

// Mock fetch for budget endpoints
beforeEach(() => {
  // @ts-expect-error - Mocking global fetch for testing
  global.fetch = jest.fn((url: string) => {
    if (typeof url === 'string' && url.includes('/api/my/expenses')) {
      return Promise.resolve({ json: () => Promise.resolve({ expenses: [] }) });
    }
    if (typeof url === 'string' && url.includes('/api/budget-items')) {
      return Promise.resolve({ json: () => Promise.resolve({ items: [] }) });
    }
    return Promise.resolve({ json: () => Promise.resolve({}) });
  });
});

import CresimaBudgetPage from '../cresima/budget/page';

describe('CresimaBudgetPage', () => {
  it('renderizza la tabella e i riepiloghi di base', async () => {
    render(<CresimaBudgetPage />);
    expect(screen.getByText(/Budget Cresima/i)).toBeInTheDocument();
    await waitFor(() => {
      // Usa getByRole per trovare l'heading specifico
      expect(screen.getByRole('heading', { name: /Totale effettivo/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Pianificato vs Effettivo/i })).toBeInTheDocument();
    });
  });
});

