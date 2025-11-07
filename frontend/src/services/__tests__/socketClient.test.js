import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';

const createMockSocket = () => {
  const socket = {
    connect: vi.fn(() => {
      socket.connected = true;
    }),
    disconnect: vi.fn(() => {
      socket.connected = false;
    }),
    removeAllListeners: vi.fn(),
    on: vi.fn(),
    once: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    connected: false,
    id: 'mock-id',
  };
  return socket;
};

let lastSocket;
const ioMock = vi.fn(() => {
  lastSocket = createMockSocket();
  return lastSocket;
});

vi.mock('socket.io-client', () => ({
  io: (...args) => ioMock(...args),
}));

let socketClient;

beforeAll(async () => {
  ({ default: socketClient } = await import('../socket/socketClient.js'));
});

describe('socket client service', () => {
  beforeEach(() => {
    ioMock.mockClear();
    if (socketClient) {
      socketClient.disconnect('dispose');
      socketClient.listenersRegistered = false;
    }
    lastSocket = undefined;
  });

  it('connect instantiates the socket and connects when disconnected', () => {
    const socket = socketClient.connect({ auth: { token: 'abc' } });

    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(ioMock.mock.calls[0][1]).toMatchObject({
      autoConnect: false,
      transports: ['websocket'],
      auth: { token: 'abc' },
    });
    expect(socket.connect).toHaveBeenCalledTimes(1);
    expect(socketClient.socket).toBe(socket);
  });

  it('reuses the existing socket when already connected', () => {
    const socket = socketClient.connect();

    socket.connect.mockClear();
    socket.connected = true;

    const secondCall = socketClient.connect();

    expect(secondCall).toBe(socket);
    expect(socket.connect).not.toHaveBeenCalled();
    expect(ioMock).toHaveBeenCalledTimes(1);
  });

  it('disconnect safely no-ops when the socket does not exist', () => {
    socketClient.disconnect();
    expect(ioMock).not.toHaveBeenCalled();
  });

  it('disconnect with dispose tears down listeners and resets flags', () => {
    const socket = socketClient.connect();

    socket.connected = true;
    socketClient.listenersRegistered = true;

    socketClient.disconnect('dispose');

    expect(socket.disconnect).toHaveBeenCalledTimes(1);
    expect(socket.removeAllListeners).toHaveBeenCalledTimes(1);
    expect(socketClient.socket).toBeNull();
    expect(socketClient.listenersRegistered).toBe(false);
  });

  it('disconnect without dispose retains the socket instance', () => {
    const socket = socketClient.connect();

    socket.connected = true;

    socketClient.disconnect();

    expect(socket.disconnect).toHaveBeenCalledTimes(1);
    expect(socket.removeAllListeners).not.toHaveBeenCalled();
    expect(socketClient.socket).toBe(socket);
  });

  it('isConnected reflects the underlying socket state', () => {
    expect(socketClient.isConnected()).toBe(false);

    const socket = socketClient.connect();
    socket.connected = true;

    expect(socketClient.isConnected()).toBe(true);
  });

  it('on registers a handler and cleanup detaches it', () => {
    const handler = vi.fn();
    const cleanup = socketClient.on('test', handler);

    expect(lastSocket.on).toHaveBeenCalledWith('test', handler);

    cleanup();

    expect(lastSocket.off).toHaveBeenCalledWith('test', handler);
  });

  it('once registers a one-time handler and cleanup detaches it', () => {
    const handler = vi.fn();
    const cleanup = socketClient.once('test-once', handler);

    expect(lastSocket.once).toHaveBeenCalledWith('test-once', handler);

    cleanup();

    expect(lastSocket.off).toHaveBeenCalledWith('test-once', handler);
  });

  it('off safely ignores requests when no socket is present', () => {
    socketClient.disconnect('dispose');

    expect(() => socketClient.off('ghost-event', () => {})).not.toThrow();
  });

  it('emit auto-connects when necessary and forwards the payload', () => {
    socketClient.disconnect('dispose');

    socketClient.emit('ping', { value: 7 });

    expect(lastSocket.connect).toHaveBeenCalledTimes(1);
    expect(lastSocket.emit).toHaveBeenCalledWith('ping', { value: 7 });
  });

  it('getId returns null without a socket and the id when connected', () => {
    expect(socketClient.getId()).toBeNull();

    const socket = socketClient.connect();
    socket.id = 'alpha';
    socket.connected = true;

    expect(socketClient.getId()).toBe('alpha');
  });
});
