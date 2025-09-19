import { createSlice } from '@reduxjs/toolkit';

const createInitialMultiplayerState = () => ({
    players: [],
    host: false,
    gameStop: false,
    maxPlayers: 4,
});

const createInitialState = () => ({
    mode: 'solo',
    owner: null,
    isOwner: false,
    score: 0,
    roomName: '',
    you: null,
    grid: [],
    currentPiece: null,
    nextPiece: null,
    multiplayer: createInitialMultiplayerState(),
});

export const gameSlice = createSlice({
    name: 'game',
    initialState: createInitialState(),
    reducers: {
        setGameMode: (state, action) => {
            const mode = action.payload === 'multiplayer' ? 'multiplayer' : 'solo';
            state.mode = mode;
            if (mode === 'solo') {
                state.multiplayer = createInitialMultiplayerState();
                state.score = 0;
            }
        },
        setGameState: (state, action) => {
            const data = action.payload ?? {};
            state.room = data.room || null;
            state.you = data.you || null;
            state.grid = Array.isArray(data.grid) ? data.grid : [];
            state.currentPiece = data.currentPiece || null;
            state.nextPiece = data.nextPiece || null;
            state.multiplayer = {
                ...state.multiplayer,
                clients: state.multiplayer.players.map((p) => {
                    for (const c of data.clients || []) {
                        if (c.id === p.id) {
                            return {
                                ...p,
                                hasLost: Boolean(c.hasLost),
                                specter: Array.isArray(c.specter) ? c.specter : [],
                            }
                        }
                    }
                })
            };
        },
        setGameStop: (state, action) => { // game_started / game_over
            const message = action.payload.room?.status || '';

            state.multiplayer.gameOver = message === 'finished';
        },
        setLobbySettings: (state, action) => { // room_broadcast
            const { room, owner, you, clients } = action.payload;
            state.roomName = room || null;
            state.owner = owner || null;
            state.you = you || null;
            state.isOwner = you && owner && you.id === owner.id;
            if (Array.isArray(clients) && clients.length > 0) {
                state.multiplayer.players = clients;
            }
        },
        setRoomName: (state, action) => { // room_created / room_joined
            state.roomName = action.payload.roomName ?? '';
        },
        resetGameState: () => createInitialState(), // room_left
    },
});

export const { setGameMode, setGameState, setLobbySettings, resetGameState, setRoomName, setGameStop } = gameSlice.actions;
export default gameSlice.reducer;
