import { createSlice } from '@reduxjs/toolkit';

const createInitialState = () => ({
    host: false,
    roomName: '',
    roomCode: '',
    maxPlayers: 4,
    isPrivate: false,
});

const lobbySlice = createSlice({
    name: 'lobby',
    initialState: createInitialState(),
    reducers: {
        setLobbySettings: (state, action) => {
            const { host, roomName, roomCode, maxPlayers, isPrivate } = action.payload;

            if (host !== undefined) {
                state.host = Boolean(host);
            }

            if (roomName !== undefined) {
                state.roomName = roomName ?? '';
            }

            if (roomCode !== undefined) {
                state.roomCode = roomCode ?? '';
            }

            if (typeof maxPlayers === 'number' && Number.isFinite(maxPlayers)) {
                state.maxPlayers = maxPlayers;
            }

            if (isPrivate !== undefined) {
                state.isPrivate = Boolean(isPrivate);
            }
        },
        resetLobby: () => createInitialState(),
    },
});

export const { setLobbySettings, resetLobby } = lobbySlice.actions;
export default lobbySlice.reducer;
