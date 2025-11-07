import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import BackButton from './BackButton.jsx';

describe('BackButton', () => {
  it('invokes the provided callback when clicked', () => {
    const handleClick = vi.fn();

    render(<BackButton onClick={handleClick} />);

    const button = screen.getByRole('button', {
      name: /go back to the previous page/i,
    });

    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
