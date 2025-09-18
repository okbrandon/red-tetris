import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import LobbyPage from '../pages/LobbyPage';

describe('LobbyPage', () => {
    it('greets the user by username from store', () => {
        const preloadedState = {
            user: { username: 'Alice' },
            game: { mode: 'solo', score: 0, multiplayer: { roomCode: '', sharedPieceQueue: [], players: [], garbageLog: [] } },
            lobby: { host: false, roomName: '', roomCode: '', maxPlayers: 4, isPrivate: false },
            notification: { isVisible: false, message: '', type: 'info', duration: 4000, id: 0 },
        };
        renderWithProviders(<LobbyPage />, { preloadedState });
        expect(screen.getByText(/welcome, alice/i)).toBeInTheDocument();
    });
});
