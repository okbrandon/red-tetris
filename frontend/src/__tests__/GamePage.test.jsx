import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import GamePage from '../pages/GamePage';

describe('GamePage', () => {
  it('renders the game title and grid', () => {
    renderWithProviders(<GamePage />);
    expect(screen.getByText(/game/i)).toBeInTheDocument();
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
});
