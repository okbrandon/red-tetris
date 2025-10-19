import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import HomePage from '../pages/HomePage';

describe('HomePage', () => {
  it('disables Start until a name is entered, then enables', () => {
    renderWithProviders(<HomePage />);
    const startBtn = screen.getByRole('button', { name: /start/i });
    expect(startBtn).toBeDisabled();

    const input = screen.getByPlaceholderText(/enter your name/i);
    fireEvent.change(input, { target: { value: 'Alice' } });
    expect(startBtn).not.toBeDisabled();
  });
});
