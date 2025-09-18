import { createSlice } from '@reduxjs/toolkit';

const createInitialMultiplayerState = () => ({
    roomCode: '',
    sharedPieceQueue: [],
    players: [],
    garbageLog: [],
});

const initialState = {
    mode: 'solo',
    score: 0,
    multiplayer: createInitialMultiplayerState(),
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        incrementScore: (state) => {
            state.score += 10;
        },
        setGameMode: (state, action) => {
            const mode = action.payload === 'multiplayer' ? 'multiplayer' : 'solo';
            state.mode = mode;
            if (mode === 'solo') {
                state.multiplayer = createInitialMultiplayerState();
                state.score = 0;
            }
        },
        setMultiplayerSnapshot: (state, action) => {
            state.multiplayer = { ...createInitialMultiplayerState(), ...action.payload };
        },
        resetGameState: () => ({
            mode: 'solo',
            score: 0,
            multiplayer: createInitialMultiplayerState(),
        }),
    },
});

export const { incrementScore, setGameMode, setMultiplayerSnapshot, resetGameState } = gameSlice.actions;
export default gameSlice.reducer;
