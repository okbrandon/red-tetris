import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import LobbyPage from '../pages/LobbyPage';

describe('LobbyPage', () => {
    it('greets the user by username from store', () => {
        const preloadedState = { user: { username: 'Alice' }, game: { score: 0 } };
        renderWithProviders(<LobbyPage />, { preloadedState });
        expect(screen.getByText(/welcome, alice/i)).toBeInTheDocument();
    });
});
