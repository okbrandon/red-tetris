import socketClient from '@/services/socket/socketClient.js';
import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  SOCKET_EVENTS,
} from '@/services/socket/events.js';
import {
  connectRequested,
  connectSucceeded,
  connectFailed,
  socketDisconnected,
  socketEventReceived,
} from './socketSlice.js';
import { showNotification } from './notificationSlice.js';
import { setServerIdentity } from './userSlice.js';
import {
  setGameState,
  setRoomName,
  setGameStatus,
  resetGameState,
  setLobbySettings,
  setGameMode,
  setPlayerOutcome,
  addLineClearLogEntry,
} from './gameSlice.js';
import { setPlayerHistory } from './playerStatsSlice.js';
import { store } from '../store.js';

let listenersBound = false;

const dispatch = (action) => store.dispatch(action);
const getState = () => store.getState();

const parseServerPayload = (payload) => {
  if (payload == null) return null;
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (error) {
      return { raw: error };
    }
  }
  return payload;
};

const formatLineClearedMessage = (payload) => {
  const scorerName =
    payload?.scorer?.username?.trim() || payload?.scorer?.id || 'Someone';
  const details = payload?.details ?? {};
  const clearedLines = Number(details?.clearedLines) || 0;
  const scoredPoints = Number(details?.scoredPoints);
  const description = details?.description?.trim();
  const penaltyLines = Math.max(clearedLines - 1, 0);

  const linesText =
    clearedLines === 1 ? '1 line' : `${clearedLines || '0'} lines`;

  let message = `${scorerName} cleared ${linesText}`;

  if (description) {
    const article = /^[aeiou]/i.test(description) ? 'an' : 'a';
    message += ` and scored ${article} ${description}!`;
  } else if (Number.isFinite(scoredPoints) && scoredPoints > 0) {
    message += ` for ${scoredPoints} points!`;
  } else {
    message += '!';
  }

  if (penaltyLines > 0) {
    const penaltyText =
      penaltyLines === 1
        ? 'Everyone gets 1 penalty line!'
        : `Everyone gets ${penaltyLines} penalty lines!`;
    message += ` ${penaltyText}`;
  }

  return message;
};

export const initializeSocket = () => {
  const socket = socketClient.connect();

  if (listenersBound) {
    if (!socketClient.isConnected()) {
      dispatch(connectRequested());
    }
    return () => {};
  }

  listenersBound = true;
  dispatch(connectRequested());

  const cleanup = [];

  const logListener = (event, direction, payload) => {
    console.log(
      `[Socket Event] ${direction.toUpperCase()} - ${event}:`,
      payload
    );
  };

  const addListenerWithLogging = (event, handler, { raw = false } = {}) => {
    const wrapped = raw
      ? (data) => {
          logListener(event, 'incoming', data);
          handler(data);
        }
      : (data) => {
          const parsedData = parseServerPayload(data);
          logListener(event, 'incoming', parsedData);
          handler(parsedData);
        };
    socket.on(event, wrapped);
    cleanup.push(() => socket.off(event, wrapped));
  };

  const addListener = addListenerWithLogging;
  addListener(
    SOCKET_EVENTS.CONNECT,
    () => {
      dispatch(connectSucceeded(socketClient.getId()));
      dispatch(
        socketEventReceived({
          direction: 'lifecycle',
          type: SOCKET_EVENTS.CONNECT,
        })
      );
    },
    { raw: true }
  );

  addListener(
    SOCKET_EVENTS.DISCONNECT,
    (reason) => {
      dispatch(socketDisconnected(reason));
      dispatch(
        socketEventReceived({
          direction: 'lifecycle',
          type: SOCKET_EVENTS.DISCONNECT,
          payload: reason,
        })
      );
    },
    { raw: true }
  );

  addListener(
    SOCKET_EVENTS.CONNECT_ERROR,
    (error) => {
      const message =
        typeof error === 'string'
          ? error
          : (error?.message ?? 'Unable to reach server');
      dispatch(connectFailed(message));
      dispatch(showNotification({ type: 'error', message }));
    },
    { raw: true }
  );

  addListener(SERVER_EVENTS.ERROR, (payload) => {
    const message = payload?.message ?? 'Unknown server error';
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.ERROR,
        payload,
      })
    );
    dispatch(showNotification({ type: 'error', message }));
  });

  addListener(SERVER_EVENTS.CLIENT_UPDATED, (payload) => {
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.CLIENT_UPDATED,
        payload,
      })
    );
    if (payload) {
      dispatch(setServerIdentity(payload));
    }
  });

  addListener(SERVER_EVENTS.ROOM_BROADCAST, (payload) => {
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.ROOM_BROADCAST,
        payload,
      })
    );
    dispatch(setLobbySettings(payload));
  });

  addListener(SERVER_EVENTS.ROOM_CREATED, (payload) => {
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.ROOM_CREATED,
        payload,
      })
    );
    dispatch(setRoomName(payload.roomName));
    dispatch(setGameMode(payload.soloJourney ? 'solo' : 'multiplayer'));
    if (!payload.soloJourney) {
      dispatch(setGameStatus({ status: 'waiting' }));
    }
  });

  addListener(SERVER_EVENTS.ROOM_JOINED, (payload) => {
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.ROOM_JOINED,
        payload,
      })
    );
    dispatch(setRoomName(payload.roomName));
    dispatch(setGameMode(payload.soloJourney ? 'solo' : 'multiplayer'));
    if (!payload.soloJourney) {
      dispatch(setGameStatus({ status: 'waiting' }));
    }
  });

  addListener(SERVER_EVENTS.ROOM_LEFT, (payload) => {
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.ROOM_LEFT,
        payload,
      })
    );
    dispatch(resetGameState());
  });

  addListener(SERVER_EVENTS.GAME_STARTED, (payload) => {
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.GAME_STARTED,
        payload,
      })
    );
    dispatch(setGameStatus({ status: 'in-game' }));
  });

  addListener(SERVER_EVENTS.GAME_STATE, (payload) => {
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.GAME_STATE,
        payload,
      })
    );
    dispatch(setGameState(payload));
  });

  addListener(SERVER_EVENTS.GAME_OVER, (payload) => {
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.GAME_OVER,
        payload,
      })
    );
    dispatch(
      setGameStatus({ status: 'game-over', winner: payload?.winner || null })
    );
  });

  addListener(SERVER_EVENTS.GAME_LOST, (payload) => {
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.GAME_LOST,
        payload,
      })
    );
    const state = getState();
    const gameState = state?.game ?? {};
    const players = Array.isArray(gameState.players) ? gameState.players : [];
    const canSpectate =
      gameState.mode === 'multiplayer' &&
      players.length >= 2 &&
      gameState.gameStatus === 'in-game';

    dispatch(
      setPlayerOutcome({
        outcome: 'lose',
        message: payload?.message || 'You lost',
        canSpectate,
      })
    );
  });

  addListener(SERVER_EVENTS.LINES_CLEARED, (payload) => {
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.LINES_CLEARED,
        payload,
      })
    );

    if (!payload) return;

    const message = formatLineClearedMessage(payload);
    dispatch(
      addLineClearLogEntry({
        message,
        scorer: payload.scorer ?? null,
        details: payload.details ?? null,
        timestamp: Date.now(),
      })
    );
  });

  addListener(SERVER_EVENTS.GAME_RESTORED, (payload) => {
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.GAME_RESTORED,
        payload,
      })
    );
    dispatch(setGameStatus({ status: 'waiting' }));
    dispatch(setLobbySettings(payload));
  });

  addListener(SERVER_EVENTS.PLAYER_STATS_BOARD, (payload) => {
    dispatch(
      socketEventReceived({
        direction: 'incoming',
        type: SERVER_EVENTS.PLAYER_STATS_BOARD,
        payload,
      })
    );
    dispatch(setPlayerHistory(payload?.gameHistory ?? []));
  });

  return () => {
    cleanup.forEach((fn) => fn());
    listenersBound = false;
    socketClient.disconnect('dispose');
    dispatch(socketDisconnected('dispose'));
  };
};

export const ensureSocketConnection = () => {
  const { status } = getState().socket;

  if (status === 'connected') {
    if (!socketClient.isConnected()) {
      socketClient.connect();
    }

    return;
  }

  if (status !== 'connecting') {
    initializeSocket();
  }
};

const logEmit = (event, payload) => {
  console.log(`[Socket Event] OUTGOING - ${event}:`, payload);
};

const emitWithTracking = (type, payload) => {
  logEmit(type, payload);
  dispatch(socketEventReceived({ direction: 'outgoing', type, payload }));
  socketClient.emit(type, payload);
};

export const sendClientUpdate = (payload) => {
  ensureSocketConnection();
  emitWithTracking(CLIENT_EVENTS.CLIENT_UPDATE, payload);
};

export const requestRoomJoin = (payload) => {
  ensureSocketConnection();
  emitWithTracking(CLIENT_EVENTS.ROOM_JOIN, payload);
};

export const requestRoomLeave = () => {
  ensureSocketConnection();
  emitWithTracking(CLIENT_EVENTS.ROOM_LEAVE);
};

export const requestStartGame = () => {
  ensureSocketConnection();
  emitWithTracking(CLIENT_EVENTS.START_GAME);
};

export const requestRestartGame = () => {
  ensureSocketConnection();
  emitWithTracking(CLIENT_EVENTS.RESTART_GAME);
};

export const requestRoomModeChange = (payload) => {
  ensureSocketConnection();
  emitWithTracking(CLIENT_EVENTS.ROOM_MODE, payload);
};

export const requestPieceMove = (payload) => {
  ensureSocketConnection();
  emitWithTracking(CLIENT_EVENTS.MOVE_PIECE, payload);
};
