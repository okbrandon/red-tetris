import { createSlice } from '@reduxjs/toolkit';

export const SOLO_ROOM_NAME = 'solo-local';

const createInitialMultiplayerState = () => ({
    players: [],
    maxPlayers: 4,
});

const createInitialState = () => ({
    mode: '',
    owner: null,
    isOwner: false,
    gameStatus: '',
    gameResult: null,
    score: 0,
    roomName: '',
    you: null,
    grid: [[]],
    nextPieces: [],
    currentPiece: null,
    multiplayer: createInitialMultiplayerState(),
});

export const gameSlice = createSlice({
    name: 'game',
    initialState: createInitialState(),
    reducers: {
        setGameMode: (state, action) => {
            const mode = action.payload;

            state.mode = action.payload;
            if (mode === 'solo') {
                state.multiplayer = createInitialMultiplayerState();
                state.score = 0;
            }
        },
        setGameState: (state, action) => {
            const { room, you, grid, currentPiece, nextPieces, clients, score } = action.payload ?? {};

            if (room) {
                state.mode = room.soloJourney ? 'solo' : 'multiplayer';
                state.roomName = room.id || state.roomName || '';
                state.owner = room.owner || state.owner;
            }
            state.you = you || null;
            state.currentPiece = currentPiece || null;
            state.grid = grid || [[]];
            state.nextPieces = Array.isArray(nextPieces) ? nextPieces : [];

            if (typeof score === 'number') {
                state.score = score;
            }

            state.multiplayer = {
                ...state.multiplayer,
                players: clients,
            };
        },
        setGameStatus: (state, action) => { // game_started / game_over
            const status = action.payload.room?.status || '';

            state.gameStatus = status;

            if (status === 'game-over') {
                const rawMessage = action.payload.message || '';
                const normalized = rawMessage.toLowerCase();
                let outcome = 'info';

                if (normalized.includes('win')) {
                    outcome = 'win';
                } else if (normalized.includes('lose')) {
                    outcome = 'lose';
                }

                state.gameResult = {
                    message: rawMessage,
                    outcome,
                };
            } else {
                state.gameResult = null;
            }
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
        resetGameState: () => createInitialState() // room_left
    },
});

export const { setGameMode, setGameState, setLobbySettings, resetGameState, setRoomName, setGameStatus } = gameSlice.actions;
export default gameSlice.reducer;
