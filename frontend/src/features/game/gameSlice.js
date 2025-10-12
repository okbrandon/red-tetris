import { createSlice } from '@reduxjs/toolkit';

export const SOLO_ROOM_NAME = 'solo-local';

const createInitialState = () => ({
    mode: '',
    owner: null,
    isOwner: false,
    gameStatus: '',
    playerOutcome: {
        outcome: '',
        message: '',
    },
    score: 0,
    roomName: '',
    you: null,
    grid: [[]],
    nextPieces: [],
    currentPiece: null,
    spectator: {
        eligible: false,
        active: false,
    },
    players: [],
});

export const gameSlice = createSlice({
    name: 'game',
    initialState: createInitialState(),
    reducers: {
        setGameMode: (state, action) => {
            const mode = action.payload;

            state.mode = action.payload;
            if (mode === 'solo') {
                state.players = [];
                state.score = 0;
                state.spectator = { eligible: false, active: false };
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

            state.players = Array.isArray(clients) ? clients : [];
        },
        setGameStatus: (state, action) => {
            const status = action.payload.status;
            state.gameStatus = status;

            if (status === 'in-game' || status === 'waiting') {
                if (status === 'in-game') {
                    state.playerOutcome = { outcome: '', message: '' };
                }
            } else if (status === 'game-over') {
                state.spectator = { eligible: false, active: false };
            }

            if (action.payload?.winner) {
                const winner = action.payload.winner;
                state.playerOutcome = (winner.id === state.you?.id)
                    ? { outcome: 'win', message: 'You are the last player standing!' }
                    : { outcome: 'lose', message: `${winner.username} has won the game.` }
            }
        },
        setPlayerOutcome: (state, action) => {
            state.playerOutcome = action.payload;
            state.spectator.eligible = Boolean(action.payload?.canSpectate);
        },
        setLobbySettings: (state, action) => { // room_broadcast
            const { room, owner, you, clients } = action.payload;
            state.roomName = room || null;
            state.owner = owner || null;
            state.you = you || null;
            state.isOwner = you && owner && you.id === owner.id;
            if (Array.isArray(clients) && clients.length > 0) {
                if (state.gameStatus && state.gameStatus !== 'waiting') {
                    // Build a Map for O(1) client lookup by id
                    const clientMap = new Map(clients.map(client => [client.id, client]));
                    state.players = state.players
                        .filter(player => clientMap.has(player.id))
                        .map(player => ({
                            ...player,
                            ...clientMap.get(player.id)
                        }));
                } else {
                    state.players = clients;
                }
            }
        },
        setRoomName: (state, action) => { // room_created / room_joined
            state.roomName = action.payload.roomName ?? '';
        },
        setSpectatorActive: (state, action) => {
            state.spectator.active = Boolean(action.payload);
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
    setSpectatorActive,
} = gameSlice.actions;
export default gameSlice.reducer;
