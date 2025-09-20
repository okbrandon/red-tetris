import { createSlice } from '@reduxjs/toolkit';

const createInitialMultiplayerState = () => ({
    players: [],
    maxPlayers: 4,
});

const createInitialState = () => ({
    mode: 'solo',
    owner: null,
    isOwner: false,
    gameStatus: 'waiting',
    score: 0,
    roomName: '',
    you: null,
    grid: [[]],
    currentPiece: null,
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
            const { room, you, grid, currentPiece, nextPiece, clients, score } = action.payload ?? {};

            if (room) {
                state.mode = room.soloJourney ? 'solo' : 'multiplayer';
                state.roomName = room.id || state.roomName || '';
                state.owner = room.owner || state.owner;
            }
            state.you = you || null;
            state.grid = grid || [[]];
            state.currentPiece = currentPiece || null;

            if (typeof score === 'number') {
                state.score = score;
            }

            state.multiplayer = {
                ...state.multiplayer,
                players: clients,
            };
        },
        setGameStatus: (state, action) => { // game_started / game_over
            const message = action.payload.room?.status || '';

            state.gameStatus = message;
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

export const { setGameMode, setGameState, setLobbySettings, resetGameState, setRoomName, setGameStatus } = gameSlice.actions;
export default gameSlice.reducer;
