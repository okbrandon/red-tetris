import gameReducer, { incrementScore, setGameMode, setMultiplayerSnapshot } from '../features/game/gameSlice';

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
            roomCode: 'ROOM',
            sharedPieceQueue: ['I', 'T'],
            players: [{ id: 'a', name: 'Alice', spectrum: [0, 1] }],
        };
        const next = gameReducer(undefined, setMultiplayerSnapshot(snapshot));
        expect(next.multiplayer.players).toHaveLength(1);
        expect(next.multiplayer.roomCode).toBe('ROOM');
    });
});
