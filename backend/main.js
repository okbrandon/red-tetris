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
const createRoom = (id, soloJourney) => {
	if (rooms.has(id))
		throw new Error('Game already exists');

	const room = new Game(id, null, soloJourney);

	rooms.set(id, room);
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
			maxPlayers: room.maxPlayers
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

// Socket.IO connection handler
io.on("connection", (socket) => {
	/** @type {Player} */
	const client = new Player(socket, socket.id);
	console.log("A user connected");

	// Handle client update
	socket.on(incomingEvents.CLIENT_UPDATE, (data) => {
		if (!data.username) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Username is required'
			}));
			return;
		}

		client.username = data.username;
		socket.emit(outgoingEvents.CLIENT_UPDATED, JSON.stringify({
			id: client.id,
			username: client.username
		}));
		console.log(`[${client.id}] Updated username to ${client.username}`);
	});

	// Handle room joining
	socket.on(incomingEvents.ROOM_JOIN, (data) => {
		const roomName = data.roomName;
		const soloJourney = data.soloJourney || false;

		if (!roomName) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Room name is required'
			}));
			return;
		}
		if (!client.username) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Username is required'
			}));
			return;
		}
		if (roomName.length < 3 || roomName.length > 16) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Room name must be between 3 and 16 characters'
			}));
			return;
		}
		if (!gameSettings.ROOM_NAME_VALIDATION_REGEX.test(roomName)) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Room name can only contain letters, numbers, underscores, and dashes'
			}));
			return;
		}
		if (roomName.startsWith(gameSettings.PREFIX_SINGLEPLAYER)) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Room name cannot start with "singleplayer@"'
			}));
			return;
		}

		const room = getRoom(roomName);

		if (!room) {
			try {
				const room = createRoom(roomName, soloJourney);

				room.assignOwner(client);
				room.playerJoin(client);

				socket.join(room.id);
				socket.emit(outgoingEvents.ROOM_CREATED, JSON.stringify({
					roomName: room.id,
					soloJourney: soloJourney,
					maxPlayers: room.maxPlayers
				}));
				room.broadcastRoom();
			} catch (error) {
				socket.emit(outgoingEvents.ERROR, JSON.stringify({
					message: error.message
				}));
			}
			console.log(rooms);
			return;
		}

		try {
			joinRoom(socket, room, client);
		} catch (error) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: error.message
			}));
			return;
		}
		console.log(rooms);
	});

	// Handle room leaving
	socket.on(incomingEvents.ROOM_LEAVE, () => {
		const room = client.room;

		if (!room) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Not in a room'
			}));
			return;
		}

		leaveRoom(socket, room, client);
		console.log(rooms);
	});

	// Handle game starting
	socket.on(incomingEvents.START_GAME, () => {
		const room = client.room;

		if (!room) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Not in a room'
			}));
			return;
		}

		if (room.status === gameStatus.IN_GAME) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Game already started'
			}));
			return;
		}

		if (room.owner !== client) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'You are not the owner'
			}));
			return;
		}

		try {
			room.start();
		} catch (error) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: error.message
			}));
			return;
		}
	});

	// Handle game restarting
	socket.on(incomingEvents.RESTART_GAME, () => {
		const room = client.room;

		if (!room) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Not in a room'
			}));
			return;
		}

		if (room.status === gameStatus.IN_GAME) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Game already started'
			}));
			return;
		}

		if (room.owner !== client) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'You are not the owner'
			}));
			return;
		}

		try {
			room.restart();
		} catch (error) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: error.message
			}));
			return;
		}
	})

	// Handle piece movement
	socket.on(incomingEvents.MOVE_PIECE, (data) => {
		const room = client.room;

		if (!room) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Not in a room'
			}));
			return;
		}

		const direction = data.direction;

		if (!direction) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Direction is required'
			}));
			return;
		}

		try {
			room.handlePieceMove(client, direction);
		} catch (error) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: error.message
			}));
			return;
		}
	});

	// Handle disconnection
	socket.on("disconnect", () => {
		const room = client.room;

		if (room) {
			leaveRoom(socket, room, client);
		}

		console.log("A user disconnected");
		console.log(rooms);
	});
});


/**
 * Starts the HTTP server.
 */
httpServer.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}/`);
});
