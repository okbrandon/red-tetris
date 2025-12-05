/**
 * @fileoverview Main server file for the multiplayer game.
 * Sets up the HTTP server, Socket.IO, game logic, and player interactions.
 */

import { createServer } from "http";
import { Server } from "socket.io";
import Player from "./player.js";
import Game from "./game.js";
import incomingEvents from "./constants/incoming-events.js";
import outgoingEvents from "./constants/outgoing-events.js";
import gameStatus from "./constants/game-status.js";
import gameSettings from "./constants/game-settings.js";
import gameModes from "./constants/game-modes.js";
import database from "./database.js";

const PORT = process.env.PORT || 3000;

/**
 * HTTP server for simple GET response.
 */
const httpServer = createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" });
	res.end("Hello World!");
});

/**
 * Socket.IO server instance.
 * @type {Server}
 */
const allowedOrigins = (process.env.SOCKET_ALLOWED_ORIGINS || '').split(',')
	.map((origin) => origin.trim())
	.filter(Boolean);

const io = new Server(httpServer, {
	cors: {
		origin: allowedOrigins.length ? allowedOrigins : [
			'http://localhost:5173',
			'https://localhost:5173',
		],
		methods: ['GET', 'POST'],
		credentials: true,
	},
});

/**
 * Active game rooms stored by ID.
 * @type {Map<string, Game>}
 */
const rooms = new Map;

/**
 * Deletes a game room.
 * @param {Game} room - The game room to delete.
 */
const deleteRoom = (room) => {
	if (!room || !rooms.has(room.id))
		return;
	if (room.updateInterval)
		clearInterval(room.updateInterval);
	rooms.delete(room.id);
	console.log(`Deleting room ${room.id}`);
}

/**
 * Creates a new game room.
 * @param {string} id - Room ID.
 * @param {boolean} soloJourney - Whether the game is in solo journey mode.
 * @returns {Game} - The created Game instance.
 * @throws {Error} - If the room already exists.
 */
const createRoom = (id, soloJourney, mode = null) => {
	if (rooms.has(id))
		throw new Error('Game already exists');

	const normalizedMode = Object.values(gameModes).includes(mode)
		? mode
		: gameModes.CLASSIC;
	const room = new Game(id, null, soloJourney, normalizedMode);

	rooms.set(room.id, room);
	return room;
}

/**
 * Adds a player to a room.
 * @param {Socket} socket - The player's socket.
 * @param {Game} room - The room to join.
 * @param {Player} client - The Player instance.
 */
const joinRoom = (socket, room, client) => {
	try {
		const roomName = room.id;

		room.playerJoin(client);

		socket.join(roomName);
		socket.emit(outgoingEvents.ROOM_JOINED, JSON.stringify({
			roomName: roomName,
			soloJourney: room.soloJourney,
			maxPlayers: room.maxPlayers,
			mode: room.mode
		}));

		room.broadcastRoom();
		console.log(`[${client.id}] Joined room ${roomName}`);
	} catch (error) {
		socket.emit(outgoingEvents.ERROR, JSON.stringify({
			message: error.message
		}));
	}
}

/**
 * Removes a player from a room.
 * @param {Socket} socket - The player's socket.
 * @param {Game} room - The room to leave.
 * @param {Player} client - The Player instance.
 */
const leaveRoom = (socket, room, client) => {
	try {
		room.playerLeave(client);
		room.broadcastRoom();
		socket.leave(room.id);

		if (room.clients.size === 0) {
			deleteRoom(room);
		}

		socket.emit(outgoingEvents.ROOM_LEFT, JSON.stringify({
			roomName: room.id
		}));
		client.sendPlayerStatsBoard();
		console.log(`[${client.id}] Left room ${room.id}`);
	} catch (error) {
		socket.emit(outgoingEvents.ERROR, JSON.stringify({
			message: error.message
		}));
	}
}

/**
 * Retrieves a room by its ID.
 * @param {string} id - The room ID.
 * @returns {Game | undefined}
 */
const getRoom = (id) => rooms.get(id);

/**
 * Attaches event handlers to a client socket.
 * @param {Socket} socket - The client socket.
 * @param {Player} client - The Player instance.
 */
const attachClientEventHandlers = (socket, client) => {
	/** @type {NodeJS.Timeout | null} */
	let availableRoomsInterval = null;

	/**
	 * Emits an error message to the client.
	 * @param {string} message - The error message.
	 */
	const emitError = (message) => {
		socket.emit(outgoingEvents.ERROR, JSON.stringify({
			message
		}));
	};

	/**
	 * Stops broadcasting available rooms to the client.
	 */
	const stopAvailableRoomsBroadcast = () => {
		if (!availableRoomsInterval)
			return;

		clearInterval(availableRoomsInterval);
		availableRoomsInterval = null;
	};

	/**
	 * Starts broadcasting available rooms to the client.
	 */
	const startAvailableRoomsBroadcast = () => {
		if (availableRoomsInterval)
			return;

		const emitAvailableRooms = async () => {
			try {
				await Promise.resolve(client.sendAvailableRooms(rooms));
			} catch (error) {
				console.error(`[${client.id}] Failed to send available rooms:`, error);
			}
		};

		void emitAvailableRooms();
		availableRoomsInterval = setInterval(() => {
			void emitAvailableRooms();
		}, 2000);
	};

	/**
	 * Confirms the client is in a room.
	 */
	const ensureInRoom = () => {
		const room = client.room;

		if (!room)
			emitError('Not in a room');
		return room;
	};

	/**
	 * Confirms the client is the owner of the room.
	 */
	const ensureIsOwner = (room, message) => {
		if (room.owner?.id !== client.id) {
			emitError(message);
			return false;
		}
		return true;
	};

	/**
	 * Handles client update events.
	 * @param {Object} data - The event data.
	 */
	const handleClientUpdate = (data = {}) => {
		if (!data.username) {
			emitError('Username is required');
			return;
		}

		try {
			client.updateUsername(data.username);
			socket.emit(outgoingEvents.CLIENT_UPDATED, JSON.stringify({
				id: client.id,
				username: client.username
			}));
			client.sendPlayerStatsBoard();
			startAvailableRoomsBroadcast();
			console.log(`[${client.id}] Updated username to ${client.username}`);
		} catch (error) {
			emitError(error.message);
		}
	};

	/**
	 * Handles room join events.
	 * @param {Object} data - The event data.
	 */
	const handleRoomJoin = (data = {}) => {
		const {
			roomName,
			soloJourney = false,
			mode = null
		} = data;

		if (!roomName) {
			emitError('Room name is required');
			return;
		}
		if (!client.username) {
			emitError('Username is required');
			return;
		}
		if (roomName.length < 3 || roomName.length > 16) {
			emitError('Room name must be between 3 and 16 characters');
			return;
		}
		if (!gameSettings.NAME_VALIDATION_REGEX.test(roomName)) {
			emitError('Room name can only contain letters, numbers, underscores, and dashes');
			return;
		}
		if (roomName.includes(gameSettings.TAG_SINGLEPLAYER)) {
			emitError('Room name has a private tag');
			return;
		}

		const existingRoom = getRoom(roomName);

		if (!existingRoom) {
			try {
				const createdRoom = createRoom(roomName, soloJourney, mode);

				createdRoom.assignOwner(client);
				createdRoom.playerJoin(client);

				socket.join(createdRoom.id);
				socket.emit(outgoingEvents.ROOM_CREATED, JSON.stringify({
					roomName: createdRoom.id,
					soloJourney,
					maxPlayers: createdRoom.maxPlayers,
					mode: createdRoom.mode
				}));
				createdRoom.broadcastRoom();
			} catch (error) {
				emitError(error.message);
			}
			console.log(rooms);
			return;
		}

		try {
			joinRoom(socket, existingRoom, client);
		} catch (error) {
			emitError(error.message);
		}
		console.log(rooms);
	};

	/**
	 * Handles room leave events.
	 */
	const handleRoomLeave = () => {
		const room = ensureInRoom();

		if (!room)
			return;

		leaveRoom(socket, room, client);
		console.log(rooms);
	};

	/**
	 * Handles start game events.
	 */
	const handleStartGame = () => {
		const room = ensureInRoom();

		if (!room)
			return;

		if (room.status === gameStatus.IN_GAME) {
			emitError('Game already started');
			return;
		}

		if (room.owner !== client) {
			emitError('You are not the owner');
			return;
		}

		try {
			room.start();
		} catch (error) {
			emitError(error.message);
		}
	};

	/**
	 * Handles reset game events.
	 */
	const handleResetGame = () => {
		const room = ensureInRoom();

		if (!room)
			return;

		if (room.status === gameStatus.IN_GAME) {
			emitError('Game already started');
			return;
		}

		if (room.owner !== client) {
			emitError('You are not the owner');
			return;
		}

		try {
			room.restart();
		} catch (error) {
			emitError(error.message);
		}
	};

	/**
	 * Handles move piece events.
	 * @param {Object} data - The event data.
	 */
	const handleMovePiece = (data = {}) => {
		const room = ensureInRoom();

		if (!room)
			return;

		const { direction } = data;

		if (!direction) {
			emitError('Direction is required');
			return;
		}

		try {
			room.handlePieceMove(client, direction);
		} catch (error) {
			emitError(error.message);
		}
	};

	/**
	 * Handles room mode change events.
	 * @param {Object} data - The event data.
	 */
	const handleRoomModeChange = (data = {}) => {
		const room = ensureInRoom();

		if (!room)
			return;

		if (!ensureIsOwner(room, 'Only the room owner can change the mode'))
			return;

		const { mode } = data;

		if (!mode) {
			emitError('Mode is required');
			return;
		}

		try {
			room.changeMode(mode);
		} catch (error) {
			emitError(error.message);
		}
	};

	/**
	 * Handles request bots events.
	 * @param {Object} data - The event data.
	 */
	const handleRequestBots = async (data = {}) => {
		const room = ensureInRoom();

		if (!room)
			return;

		if (!ensureIsOwner(room, 'Only the room owner can request bots'))
			return;

		const botCount = data.botCount || 1;

		try {
			await room.requestBots(botCount);
		} catch (error) {
			emitError(error.message);
		}
	};

	/**
	 * Handles disconnect bots events.
	 */
	const handleDisconnectBots = async () => {
		const room = ensureInRoom();

		if (!room)
			return;

		if (!ensureIsOwner(room, 'Only the room owner can disconnect bots'))
			return;

		try {
			await room.disconnectBots();
		} catch (error) {
			emitError(error.message);
		}
	};

	/**
	 * Handles client disconnect events.
	 */
	const handleDisconnect = () => {
		const room = client.room;

		if (room)
			leaveRoom(socket, room, client);

		stopAvailableRoomsBroadcast();

		console.log('A user disconnected');
		console.log(rooms);
	};

	/**
	 * Event handlers mapping.
	 */
	const handlers = {
		[incomingEvents.CLIENT_UPDATE]: handleClientUpdate,
		[incomingEvents.ROOM_JOIN]: handleRoomJoin,
		[incomingEvents.ROOM_LEAVE]: handleRoomLeave,
		[incomingEvents.START_GAME]: handleStartGame,
		[incomingEvents.RESET_GAME]: handleResetGame,
		[incomingEvents.MOVE_PIECE]: handleMovePiece,
		[incomingEvents.ROOM_MODE]: handleRoomModeChange,
		[incomingEvents.REQUEST_BOTS]: handleRequestBots,
		[incomingEvents.DISCONNECT_BOTS]: handleDisconnectBots
	};

	/**
	 * Attaching event handlers to the socket.
	 */
	Object.entries(handlers).forEach(([event, handler]) => {
		socket.on(event, handler);
	});

	/**
	 * Handles client disconnect events.
	 */
	socket.on('disconnect', handleDisconnect);
};

// Socket.IO connection handler
io.on("connection", (socket) => {
	/** @type {Player} */
	const client = new Player(socket, socket.id);

	console.log("A user connected");
	attachClientEventHandlers(socket, client);
});

/**
 * Starts the HTTP server. Connects to PostgreSQL first.
 */
database.connect()
	.then(() => {
		httpServer.listen(PORT, () => {
			console.log(`Server running at http://localhost:${PORT}/`);
		});
	})
	.catch((err) => {
		console.error('[PostgreSQL] Connection failed:', err);
		process.exit(1);
	});
