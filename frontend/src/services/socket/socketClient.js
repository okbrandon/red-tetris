import { io } from 'socket.io-client';
import { SOCKET_URL } from './events.js';

const createSocketClient = () => {
  let socket = null;
  let listenersRegistered = false;

  const ensureSocket = (options = {}) => {
    if (!socket) {
      socket = io(SOCKET_URL, {
        autoConnect: false,
        transports: ['websocket'],
        ...options,
      });
    }

    return socket;
  };

  const connect = (options = {}) => {
    const activeSocket = ensureSocket(options);
    if (!activeSocket.connected) {
      activeSocket.connect();
    }
    return activeSocket;
  };

  const disconnect = (reason) => {
    if (!socket) return;
    if (socket.connected) {
      socket.disconnect();
    }
    if (reason === 'dispose') {
      socket.removeAllListeners();
      socket = null;
      listenersRegistered = false;
    }
  };

  const isConnected = () => Boolean(socket?.connected);

  const off = (event, handler) => {
    if (!socket) return;
    socket.off(event, handler);
  };

  const on = (event, handler) => {
    connect();
    socket.on(event, handler);
    return () => off(event, handler);
  };

  const once = (event, handler) => {
    connect();
    socket.once(event, handler);
    return () => off(event, handler);
  };

  const emit = (event, payload) => {
    connect();
    socket.emit(event, payload);
  };

  const getId = () => socket?.id ?? null;

  return {
    connect,
    disconnect,
    isConnected,
    on,
    once,
    off,
    emit,
    getId,
    get socket() {
      return socket;
    },
    set socket(value) {
      socket = value;
    },
    get listenersRegistered() {
      return listenersRegistered;
    },
    set listenersRegistered(value) {
      listenersRegistered = value;
    },
  };
};

const socketClient = createSocketClient();

export default socketClient;
export { createSocketClient };
