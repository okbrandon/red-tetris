import gameReducer, { incrementScore, setGameMode, setGameState } from '../features/game/gameSlice';

describe('gameSlice', () => {
    it('increments score by 10', () => {
        const next = gameReducer(undefined, incrementScore());
        expect(next.score).toBe(10);
    });

    it('switches to multiplayer mode', () => {
        const next = gameReducer(undefined, setGameMode('multiplayer'));
        expect(next.mode).toBe('multiplayer');
    });

    it('stores multiplayer snapshot data', () => {
        const snapshot = {
            sharedPieceQueue: ['I', 'T'],
            players: [{ id: 'a', name: 'Alice', spectrum: [0, 1] }],
        };
        const next = gameReducer(undefined, setGameState(snapshot));
        expect(next.multiplayer.players).toHaveLength(1);
    });
});
