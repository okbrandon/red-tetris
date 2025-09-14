import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    score: 0,
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        incrementScore: (state) => {
            state.score += 10;
        },
    },
});

export const { incrementScore } = gameSlice.actions;
export default gameSlice.reducer;
