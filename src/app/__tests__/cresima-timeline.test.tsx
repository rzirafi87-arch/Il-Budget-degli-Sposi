import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import CresimaTimelinePage from '../[locale]/(routes)/cresima/timeline/page';

describe('CresimaTimelinePage', () => {
  it('mostra la Timeline Cresima e blocchi temporali', () => {
    render(<CresimaTimelinePage />);
    expect(screen.getByText(/Timeline Cresima/i)).toBeInTheDocument();
    expect(screen.getByText(/2-3 mesi prima/i)).toBeInTheDocument();
  });
});

