import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  CLIENT_EVENTS,
  SERVER_EVENTS,
  SOCKET_EVENTS,
} from '@/services/socket/events.js';
import {
  connectRequested,
  connectSucceeded,
  socketEventReceived,
} from '../slices/socketSlice.js';
import {
  setGameStatus,
  setPlayerOutcome,
  setAvailableRooms,
} from '../slices/gameSlice.js';
import { showNotification } from '../slices/notificationSlice.js';
import { setPlayerHistory } from '../slices/playerStatsSlice.js';

const dispatch = vi.fn();
let state;
const getState = vi.fn(() => state);
const mockedStore = { dispatch, getState };

let handlers;
let socketMock;

const createSocketMock = () => ({
  connected: false,
  on: vi.fn((event, handler) => {
    handlers.set(event, handler);
  }),
  off: vi.fn((event, handler) => {
    if (handlers.get(event) === handler) {
      handlers.delete(event);
    }
  }),
  connect: vi.fn(() => {
    socketMock.connected = true;
  }),
  disconnect: vi.fn(() => {
    socketMock.connected = false;
  }),
  emit: vi.fn(),
});

const socketClientMock = {
  connect: vi.fn(() => {
    socketMock.connect();
    return socketMock;
  }),
  disconnect: vi.fn(),
  isConnected: vi.fn(() => socketMock?.connected ?? false),
  emit: vi.fn(),
  getId: vi.fn(() => 'socket-id'),
};

const resetEnvironment = () => {
  handlers = new Map();
  socketMock = createSocketMock();
  socketClientMock.connect.mockImplementation(() => {
    socketMock.connect();
    return socketMock;
  });
  socketClientMock.disconnect.mockReset();
  socketClientMock.isConnected.mockImplementation(() => socketMock.connected);
  socketClientMock.emit.mockReset();
  socketMock.on.mockClear();
  socketMock.off.mockClear();
  socketMock.emit.mockClear();
  socketMock.connect.mockClear();
  socketMock.disconnect.mockClear();
  dispatch.mockClear();
  getState.mockClear();
  state = {
    socket: { status: 'idle' },
    game: {
      mode: 'multiplayer',
      players: [{ id: 'self' }, { id: 'other' }],
      gameStatus: 'in-game',
    },
  };
};

const loadModule = async () => {
  const module = await import('../slices/socketThunks.js');
  return module;
};

beforeEach(() => {
  vi.resetModules();
  resetEnvironment();
  vi.doMock('../store.js', () => ({ store: mockedStore }));
  vi.doMock('@/services/socket/socketClient.js', () => ({
    default: socketClientMock,
  }));
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unmock('../store.js');
  vi.unmock('@/services/socket/socketClient.js');
});

describe('socket thunks', () => {
  it('initialises the socket, binds listeners, and processes events', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const { initializeSocket } = await loadModule();

    const cleanup = initializeSocket();

    expect(socketClientMock.connect).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: connectRequested.type })
    );

    const trigger = (event, payload) => {
      const handler = handlers.get(event);
      expect(handler).toBeTypeOf('function');
      handler(payload);
    };

    trigger(SOCKET_EVENTS.CONNECT, undefined);
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: connectSucceeded.type })
    );

    trigger(SOCKET_EVENTS.DISCONNECT, 'policy');
    trigger(SOCKET_EVENTS.CONNECT_ERROR, new Error('boom'));
    trigger(SOCKET_EVENTS.CONNECT_ERROR, 'string-error');
    trigger(SOCKET_EVENTS.CONNECT_ERROR, undefined);

    trigger(SERVER_EVENTS.ERROR, { message: 'bad' });
    trigger(SERVER_EVENTS.ERROR, null);
    trigger(SERVER_EVENTS.CLIENT_UPDATED, { id: 'server', username: 'srv' });
    trigger(SERVER_EVENTS.CLIENT_UPDATED, null);
    trigger(SERVER_EVENTS.ROOM_BROADCAST, {
      room: { id: 'lobby', owner: { id: 'owner' }, mode: 'classic' },
      you: { id: 'owner' },
      clients: [{ id: 'owner' }],
    });
    trigger(SERVER_EVENTS.ROOM_CREATED, {
      roomName: 'created',
      soloJourney: false,
    });
    trigger(SERVER_EVENTS.ROOM_CREATED, {
      roomName: 'created-solo',
      soloJourney: true,
    });
    trigger(SERVER_EVENTS.ROOM_JOINED, {
      roomName: 'joined',
      soloJourney: true,
    });
    trigger(SERVER_EVENTS.ROOM_JOINED, {
      roomName: 'joined-multi',
      soloJourney: false,
    });
    trigger(SERVER_EVENTS.ROOM_LEFT, {});
    trigger(SERVER_EVENTS.GAME_STARTED, {});
    expect(
      dispatch.mock.calls.some(
        ([action]) =>
          action.type === setGameStatus.type &&
          action.payload.status === 'in-game'
      )
    ).toBe(true);

    trigger(SERVER_EVENTS.AVAILABLE_ROOMS, [
      { id: 'alpha', owner: { username: 'owner' }, currentPlayers: 1, maxPlayers: 4 },
      { id: 42 },
    ]);
    expect(
      dispatch.mock.calls.some(
        ([action]) => action.type === setAvailableRooms.type
      )
    ).toBe(true);

    trigger(
      SERVER_EVENTS.GAME_STATE,
      JSON.stringify({
        room: { id: 'alpha', soloJourney: true },
        you: { score: 20 },
        grid: [[0]],
        nextPieces: [1],
      })
    );

    trigger(SERVER_EVENTS.GAME_OVER, {
      winner: { id: 'other', username: 'Other' },
    });
    trigger(SERVER_EVENTS.GAME_OVER, {});

    trigger(SERVER_EVENTS.GAME_LOST, { message: 'Defeated' });
    expect(
      dispatch.mock.calls.some(
        ([action]) =>
          action.type === setPlayerOutcome.type &&
          action.payload.message === 'Defeated'
      )
    ).toBe(true);

    state.game = {
      mode: 'solo',
      players: [{ id: 'solo' }],
      gameStatus: 'waiting',
    };
    trigger(SERVER_EVENTS.GAME_LOST, {});
    expect(
      dispatch.mock.calls.some(
        ([action]) =>
          action.type === setPlayerOutcome.type &&
          action.payload.message === 'You lost'
      )
    ).toBe(true);

    state = { ...state, game: undefined };
    trigger(SERVER_EVENTS.GAME_LOST, {});

    trigger(SERVER_EVENTS.LINES_CLEARED, 'not-json');
    trigger(SERVER_EVENTS.LINES_CLEARED, null);
    trigger(SERVER_EVENTS.LINES_CLEARED, {
      scorer: { username: 'Alice' },
      details: { clearedLines: 4, description: 'All Clear', scoredPoints: 120 },
    });
    trigger(SERVER_EVENTS.LINES_CLEARED, {
      scorer: { id: 'p1' },
      details: { clearedLines: 1, scoredPoints: 50 },
    });
    trigger(SERVER_EVENTS.LINES_CLEARED, {
      scorer: { username: 'Chris' },
      details: { clearedLines: 2, description: 'T-Spin Double' },
    });

    expect(
      dispatch.mock.calls.some(
        ([action]) => action.type === showNotification.type
      )
    ).toBe(true);

    expect(
      dispatch.mock.calls.some(
        ([action]) =>
          action.type === showNotification.type &&
          action.payload?.message === 'Unable to reach server'
      )
    ).toBe(true);

    trigger(SERVER_EVENTS.GAME_RESTORED, { mode: 'classic' });
    trigger(SERVER_EVENTS.PLAYER_STATS_BOARD, { gameHistory: [{ id: 1 }] });

    cleanup();

    expect(socketMock.off).toHaveBeenCalled();
    expect(socketClientMock.disconnect).toHaveBeenCalledWith('dispose');

    consoleLog.mockRestore();
    consoleError.mockRestore();
  });

  it('reuses existing listeners and triggers reconnect when needed', async () => {
    const { initializeSocket } = await loadModule();

    initializeSocket();
    socketMock.connected = false;
    socketClientMock.connect.mockImplementationOnce(() => socketMock);
    dispatch.mockClear();
    const result = initializeSocket();

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: connectRequested.type })
    );
    expect(result).toBeTypeOf('function');
    result();
  });

  it('ensures the socket connection depending on state', async () => {
    const module = await loadModule();
    const { ensureSocketConnection } = module;

    state.socket.status = 'connected';
    socketMock.connected = false;
    ensureSocketConnection();
    expect(socketClientMock.connect).toHaveBeenCalled();

    socketClientMock.connect.mockClear();
    state.socket.status = 'connecting';
    ensureSocketConnection();
    expect(socketClientMock.connect).not.toHaveBeenCalled();

    socketClientMock.connect.mockClear();
    state.socket.status = 'idle';
    dispatch.mockClear();
    ensureSocketConnection();
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: connectRequested.type })
    );
  });

  it('emits outgoing events with tracking helpers', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    const {
      sendClientUpdate,
      requestRoomJoin,
      requestRoomLeave,
      requestStartGame,
      requestRestartGame,
      requestRoomModeChange,
      requestPieceMove,
    } = await loadModule();

    state.socket.status = 'connected';
    socketMock.connected = true;

    sendClientUpdate({ foo: 'bar' });
    requestRoomJoin({ room: 'alpha' });
    requestRoomLeave();
    requestStartGame();
    requestRestartGame();
    requestRoomModeChange({ mode: 'hardcore' });
    requestPieceMove({ direction: 'left' });

    expect(socketClientMock.emit.mock.calls.map((call) => call[0])).toEqual([
      CLIENT_EVENTS.CLIENT_UPDATE,
      CLIENT_EVENTS.ROOM_JOIN,
      CLIENT_EVENTS.ROOM_LEAVE,
      CLIENT_EVENTS.START_GAME,
      CLIENT_EVENTS.RESTART_GAME,
      CLIENT_EVENTS.ROOM_MODE,
      CLIENT_EVENTS.MOVE_PIECE,
    ]);

    expect(
      dispatch.mock.calls
        .filter(([action]) => action.type === socketEventReceived.type)
        .map(([action]) => action.payload.type)
    ).toEqual([
      CLIENT_EVENTS.CLIENT_UPDATE,
      CLIENT_EVENTS.ROOM_JOIN,
      CLIENT_EVENTS.ROOM_LEAVE,
      CLIENT_EVENTS.START_GAME,
      CLIENT_EVENTS.RESTART_GAME,
      CLIENT_EVENTS.ROOM_MODE,
      CLIENT_EVENTS.MOVE_PIECE,
    ]);

    consoleLog.mockRestore();
  });

  it('records player history updates', async () => {
    const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { initializeSocket } = await loadModule();

    initializeSocket();
    const handler = handlers.get(SERVER_EVENTS.PLAYER_STATS_BOARD);
    handler({ gameHistory: [{ id: 'x' }] });
    handler();

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: setPlayerHistory.type })
    );

    consoleLog.mockRestore();
  });
});
