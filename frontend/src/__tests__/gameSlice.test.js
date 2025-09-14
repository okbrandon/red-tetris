import gameReducer, { incrementScore } from '../features/game/gameSlice';

describe('gameSlice', () => {
    it('increments score by 10', () => {
        const state = { score: 0 };
        const next = gameReducer(state, incrementScore());
        expect(next.score).toBe(10);
    });
});
