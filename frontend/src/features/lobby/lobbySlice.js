import { createSlice } from '@reduxjs/toolkit';

const createInitialState = () => ({
    host: false,
    roomName: '',
    maxPlayers: 4,
    serverSnapshot: null,
});

const lobbySlice = createSlice({
    name: 'lobby',
    initialState: createInitialState(),
    reducers: {
        setLobbySettings: (state, action) => {
            const { host, roomName } = action.payload;

            if (host !== undefined) {
                state.host = Boolean(host);
            }

            if (roomName !== undefined) {
                state.roomName = roomName ?? '';
            }
        },
        setServerSnapshot: (state, action) => {
            state.serverSnapshot = action.payload ?? null;
        },
        resetLobby: () => createInitialState(),
    },
});

export const { setLobbySettings, setServerSnapshot, resetLobby } = lobbySlice.actions;
export default lobbySlice.reducer;
