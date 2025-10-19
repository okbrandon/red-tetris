import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'idle',
  socketId: null,
  lastError: null,
  lastEvent: null,
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    connectRequested: (state) => {
      state.status = 'connecting';
      state.lastError = null;
    },
    connectSucceeded: (state, action) => {
      state.status = 'connected';
      state.socketId = action.payload ?? null;
      state.lastError = null;
    },
    connectFailed: (state, action) => {
      state.status = 'error';
      state.lastError = action.payload ?? 'Unknown connection error';
    },
    socketDisconnected: (state, action) => {
      state.status = 'disconnected';
      state.socketId = null;
      state.lastError = action.payload ?? null;
    },
    socketEventReceived: (state, action) => {
      state.lastEvent = action.payload;
    },
    clearSocketEvent: (state) => {
      state.lastEvent = null;
    },
  },
});

export const {
  connectRequested,
  connectSucceeded,
  connectFailed,
  socketDisconnected,
  socketEventReceived,
  clearSocketEvent,
} = socketSlice.actions;

export default socketSlice.reducer;
