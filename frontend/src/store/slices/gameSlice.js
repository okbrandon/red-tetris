import { createSlice } from '@reduxjs/toolkit';

export const SOLO_ROOM_NAME = 'solo-local';
const MAX_LINE_CLEAR_LOG_SIZE = 6;

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
  roomMode: '',
  you: null,
  grid: [[]],
  nextPieces: [],
  currentPiece: null,
  spectator: {
    eligible: false,
    active: false,
  },
  players: [],
  isResultModalOpen: false,
  lineClearLog: [],
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
      const { room, you, grid, currentPiece, nextPieces, clients } =
        action.payload ?? {};

      if (room) {
        state.mode = room.soloJourney ? 'solo' : 'multiplayer';
        state.roomName = room.id || state.roomName || '';
        state.owner = room.owner || state.owner;
        state.roomMode = room.mode || state.roomMode || '';
      }
      state.you = you || null;
      state.currentPiece = currentPiece || null;
      state.grid = grid || [[]];
      state.nextPieces = Array.isArray(nextPieces) ? nextPieces : [];

      if (typeof you.score === 'number') {
        state.score = you.score;
      }

      state.players = Array.isArray(clients) ? clients : [];
    },
    setGameStatus: (state, action) => {
      const status = action.payload.status;
      state.gameStatus = status;

      if (status === 'in-game') {
        state.playerOutcome = { outcome: '', message: '' };
        state.lineClearLog = [];
      } else if (status === 'waiting') {
        state.lineClearLog = [];
      } else if (status === 'game-over') {
        state.spectator = { eligible: false, active: false };
      }

      if (action.payload?.winner) {
        const winner = action.payload.winner;
        state.playerOutcome =
          winner.id === state.you?.id
            ? { outcome: 'win', message: 'You are the last player standing!' }
            : {
                outcome: 'lose',
                message: `${winner.username} has won the game.`,
              };
      }
    },
    setPlayerOutcome: (state, action) => {
      state.playerOutcome = action.payload;
      state.spectator.eligible = Boolean(action.payload?.canSpectate);
    },
    setLobbySettings: (state, action) => {
      // room_broadcast
      const { room, you, clients } = action.payload ?? {};
      const isRoomObject = room && typeof room === 'object';
      const nextOwner = isRoomObject ? room.owner : state.owner;
      const nextRoomName = isRoomObject ? room.id : room;
      const nextRoomMode = isRoomObject ? room.mode : undefined;

      state.roomName =
        typeof nextRoomName === 'string' ? nextRoomName : state.roomName || '';
      state.owner = nextOwner || null;
      if (typeof nextRoomMode === 'string') {
        state.roomMode = nextRoomMode;
      } else {
        state.roomMode = state.roomMode || '';
      }
      state.you = you || null;
      state.isOwner =
        Boolean(you?.id) && Boolean(nextOwner?.id) && you.id === nextOwner.id;
      if (Array.isArray(clients) && clients.length > 0) {
        if (state.gameStatus && state.gameStatus !== 'waiting') {
          // Build a Map for O(1) client lookup by id
          const clientMap = new Map(
            clients.map((client) => [client.id, client])
          );
          state.players = state.players
            .filter((player) => clientMap.has(player.id))
            .map((player) => ({
              ...player,
              ...clientMap.get(player.id),
            }));
        } else {
          state.players = clients;
        }
      }
    },
    setRoomName: (state, action) => {
      // room_created / room_joined
      state.roomName = action.payload.roomName ?? '';
    },
    setSpectatorActive: (state, action) => {
      state.spectator.active = Boolean(action.payload);
    },
    setIsResultModalOpen: (state, action) => {
      state.isResultModalOpen = Boolean(action.payload);
    },
    addLineClearLogEntry: (state, action) => {
      const payload = action.payload ?? {};
      if (!payload.message) return;

      const entry = {
        id:
          payload.id ??
          `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message: payload.message,
        scorer: payload.scorer ?? null,
        details: payload.details ?? null,
        timestamp: Number.isFinite(payload.timestamp)
          ? payload.timestamp
          : Date.now(),
      };

      const currentLog = Array.isArray(state.lineClearLog)
        ? state.lineClearLog
        : [];
      state.lineClearLog = [entry, ...currentLog].slice(
        0,
        MAX_LINE_CLEAR_LOG_SIZE
      );
    },
    resetGameState: () => createInitialState(), // room_left
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
  setIsResultModalOpen,
  addLineClearLogEntry,
} = gameSlice.actions;
export default gameSlice.reducer;
