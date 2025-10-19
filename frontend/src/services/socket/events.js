export const CLIENT_EVENTS = Object.freeze({
  CLIENT_UPDATE: 'client-update',
  ROOM_JOIN: 'room-join',
  ROOM_LEAVE: 'room-leave',
  START_GAME: 'start-game',
  RESTART_GAME: 'restart-game',
  MOVE_PIECE: 'move-piece',
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
});

export const SOCKET_EVENTS = Object.freeze({
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  RECONNECT: 'reconnect',
});

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';
