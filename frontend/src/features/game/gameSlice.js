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
    playerOutcome: null,
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
        setGameStatus: (state, action) => {
            state.gameStatus = action.payload;
        },
        setPlayerOutcome: (state, action) => {
            state.playerOutcome = action.payload;
        },
        setLobbySettings: (state, action) => { // room_broadcast
            const { room, owner, you, clients } = action.payload;
            state.roomName = room || null;
            state.owner = owner || null;
            state.you = you || null;
            state.isOwner = you && owner && you.id === owner.id;
            if (Array.isArray(clients) && clients.length > 0) {
                if (state.gameStatus === 'in-game') {
                    // Build a Map for O(1) client lookup by id
                    const clientMap = new Map(clients.map(client => [client.id, client]));
                    state.multiplayer.players = state.multiplayer.players
                        .filter(player => clientMap.has(player.id))
                        .map(player => ({
                            ...player,
                            ...clientMap.get(player.id)
                        }));
                } else {
                    state.multiplayer.players = clients;
                }
            }
        },
        setRoomName: (state, action) => { // room_created / room_joined
            state.roomName = action.payload.roomName ?? '';
        },
        resetGameState: () => createInitialState() // room_left
    },
});

export const {
    setGameMode,
    setGameState,
    setLobbySettings,
    resetGameState,
    setRoomName,
    setGameStatus,
    setPlayerOutcome,
} = gameSlice.actions;
export default gameSlice.reducer;
