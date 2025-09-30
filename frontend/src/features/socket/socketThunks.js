import socketClient from '../../services/socket/socketClient.js';
import { CLIENT_EVENTS, SERVER_EVENTS, SOCKET_EVENTS } from '../../services/socket/events.js';
import {
    connectRequested,
    connectSucceeded,
    connectFailed,
    socketDisconnected,
    socketEventReceived,
} from './socketSlice.js';
import { showNotification } from '../notification/notificationSlice.js';
import { setServerIdentity } from '../user/userSlice.js';
import { setGameState, setRoomName, setGameStatus, resetGameState, setLobbySettings } from '../game/gameSlice.js';
import { store } from '../../store.js';

let listenersBound = false;

const dispatch = (action) => store.dispatch(action);
const getState = () => store.getState();

const parseServerPayload = (payload) => {
    if (payload == null) return null;
    if (typeof payload === 'string') {
        try {
            return JSON.parse(payload);
        } catch (error) {
            return { raw: payload };
        }
    }
    return payload;
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

    const addListener = (event, handler, { raw = false } = {}) => {
        const wrapped = raw
            ? handler
            : (data) => handler(parseServerPayload(data));
        socket.on(event, wrapped);
        cleanup.push(() => socket.off(event, wrapped));
    };

    addListener(SOCKET_EVENTS.CONNECT, () => {
        dispatch(connectSucceeded(socketClient.getId()));
        dispatch(socketEventReceived({ direction: 'lifecycle', type: SOCKET_EVENTS.CONNECT }));
    }, { raw: true });

    addListener(SOCKET_EVENTS.DISCONNECT, (reason) => {
        dispatch(socketDisconnected(reason));
        dispatch(socketEventReceived({ direction: 'lifecycle', type: SOCKET_EVENTS.DISCONNECT, payload: reason }));
    }, { raw: true });

    addListener(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
        const message = typeof error === 'string' ? error : error?.message ?? 'Unable to reach server';
        dispatch(connectFailed(message));
        dispatch(showNotification({ type: 'error', message }));
    }, { raw: true });

    addListener(SERVER_EVENTS.ERROR, (payload) => {
        const message = payload?.message ?? 'Unknown server error';
        dispatch(socketEventReceived({ direction: 'incoming', type: SERVER_EVENTS.ERROR, payload }));
        dispatch(showNotification({ type: 'error', message }));
    });

    addListener(SERVER_EVENTS.CLIENT_UPDATED, (payload) => { // done
        dispatch(socketEventReceived({ direction: 'incoming', type: SERVER_EVENTS.CLIENT_UPDATED, payload }));
        if (payload) {
            dispatch(setServerIdentity(payload));
        }
    });

    addListener(SERVER_EVENTS.ROOM_BROADCAST, (payload) => { // done
        dispatch(socketEventReceived({ direction: 'incoming', type: SERVER_EVENTS.ROOM_BROADCAST, payload }));
        dispatch(setLobbySettings(payload));
    });

    addListener(SERVER_EVENTS.ROOM_CREATED, (payload) => { // done
        dispatch(socketEventReceived({ direction: 'incoming', type: SERVER_EVENTS.ROOM_CREATED, payload }));
        dispatch(setRoomName(payload));
    });

    addListener(SERVER_EVENTS.ROOM_JOINED, (payload) => { // done
        dispatch(socketEventReceived({ direction: 'incoming', type: SERVER_EVENTS.ROOM_JOINED, payload }));
        dispatch(setRoomName(payload));
    });

    addListener(SERVER_EVENTS.ROOM_LEFT, (payload) => { // done
        dispatch(socketEventReceived({ direction: 'incoming', type: SERVER_EVENTS.ROOM_LEFT, payload }));
        dispatch(resetGameState());
    });

    addListener(SERVER_EVENTS.GAME_STARTED, (payload) => { // done
        dispatch(socketEventReceived({ direction: 'incoming', type: SERVER_EVENTS.GAME_STARTED, payload }));
        dispatch(setGameStatus({ room: { status: 'in-game' } }));
    });

    addListener(SERVER_EVENTS.GAME_STATE, (payload) => { // done
        dispatch(socketEventReceived({ direction: 'incoming', type: SERVER_EVENTS.GAME_STATE, payload }));
        dispatch(setGameState(payload));
    });

    addListener(SERVER_EVENTS.GAME_OVER, (payload) => { // done
        dispatch(socketEventReceived({ direction: 'incoming', type: SERVER_EVENTS.GAME_OVER, payload }));
        const message = typeof payload?.message === 'string' ? payload.message : 'Game Over';
        dispatch(setGameStatus({ room: { status: 'game-over' }, message }));
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

const emitWithTracking = (type, payload) => {
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

export const requestPieceMove = (payload) => {
    ensureSocketConnection();
    emitWithTracking(CLIENT_EVENTS.MOVE_PIECE, payload);
};
