import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  history: [],
  lastUpdatedAt: null,
};

const normalizeHistory = (entries) => {
  if (!Array.isArray(entries)) {
    return [];
  }

  return entries.slice(0, 5).map((entry) => ({
    ...entry,
  }));
};

const playerStatsSlice = createSlice({
  name: 'playerStats',
  initialState,
  reducers: {
    setPlayerHistory: (state, action) => {
      state.history = normalizeHistory(action.payload);
      state.lastUpdatedAt = Date.now();
    },
    resetPlayerHistory: () => initialState,
  },
});

export const { setPlayerHistory, resetPlayerHistory } =
  playerStatsSlice.actions;
export default playerStatsSlice.reducer;
