export const CLIENT_EVENTS = Object.freeze({
  CLIENT_UPDATE: 'client-update',
  ROOM_JOIN: 'room-join',
  ROOM_LEAVE: 'room-leave',
  START_GAME: 'start-game',
  RESTART_GAME: 'reset-game',
  MOVE_PIECE: 'move-piece',
  ROOM_MODE: 'room-mode',
});

export const SERVER_EVENTS = Object.freeze({
  ERROR: 'error',
  CLIENT_UPDATED: 'client-updated',
  ROOM_CREATED: 'room-created',
  ROOM_JOINED: 'room-joined',
  ROOM_LEFT: 'room-left',
  ROOM_BROADCAST: 'room-broadcast',
  GAME_STARTED: 'game-started',
  GAME_STATE: 'game-state',
  GAME_OVER: 'game-over',
  GAME_LOST: 'game-lost',
  LINES_CLEARED: 'lines-cleared',
  GAME_RESTORED: 'game-restored',
});

export const SOCKET_EVENTS = Object.freeze({
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
});

export const HOST_NAME = import.meta.env.VITE_HOST_NAME ?? 'localhost';

const _VITE_SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export const SOCKET_URL = _VITE_SOCKET_URL
  ? _VITE_SOCKET_URL.replace('HOST_NAME', HOST_NAME)
  : `http://${HOST_NAME}:3000`;
