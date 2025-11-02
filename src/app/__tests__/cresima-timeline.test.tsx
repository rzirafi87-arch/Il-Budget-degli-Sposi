import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';

import CresimaTimelinePage from '../cresima/timeline/page';

describe('CresimaTimelinePage', () => {
  it('mostra la Timeline Cresima e blocchi temporali', () => {
    render(<CresimaTimelinePage />);
    expect(screen.getByText(/Timeline Cresima/i)).toBeInTheDocument();
    expect(screen.getByText(/2-3 mesi prima/i)).toBeInTheDocument();
  });
});

