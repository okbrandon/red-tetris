import { io } from 'socket.io-client';
import { SOCKET_URL } from './events.js';

class SocketClient {
  constructor() {
    this.socket = null;
    this.listenersRegistered = false;
  }

  connect(options = {}) {
    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        autoConnect: false,
        transports: ['websocket'],
        ...options,
      });
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  disconnect(reason) {
    if (!this.socket) return;
    if (this.socket.connected) {
      this.socket.disconnect();
    }
    if (reason === 'dispose') {
      this.socket.removeAllListeners();
      this.socket = null;
      this.listenersRegistered = false;
    }
  }

  isConnected() {
    return Boolean(this.socket?.connected);
  }

  on(event, handler) {
    if (!this.socket) this.connect();
    this.socket.on(event, handler);
    return () => this.off(event, handler);
  }

  once(event, handler) {
    if (!this.socket) this.connect();
    this.socket.once(event, handler);
    return () => this.off(event, handler);
  }

  off(event, handler) {
    if (!this.socket) return;
    this.socket.off(event, handler);
  }

  emit(event, payload) {
    if (!this.socket) this.connect();
    this.socket.emit(event, payload);
  }

  getId() {
    return this.socket?.id ?? null;
  }
}

const socketClient = new SocketClient();

export default socketClient;
