const { createServer } = require("http")
const { Server } = require("socket.io")
const Player = require("./player");
const Game = require("./game");
const incomingEvents = require("./constants/incoming-events.js");
const outgoingEvents = require("./constants/outgoing-events.js");
const gameStatus = require("./constants/game-status.js");

const PORT = process.env.PORT || 3000;

const httpServer = createServer((req, res) => {
	res.writeHead(200, { "Content-Type": "text/plain" });
	res.end("Hello World!");
});
const io = new Server(httpServer, {});
const rooms = new Map;

const deleteRoom = (room) => {
	if (!room || !rooms.has(room.id))
		return;
	if (room.updateInterval)
		clearInterval(room.updateInterval);
	rooms.delete(room.id);
	console.log(`Deleting room ${room.id}`);
}

const createRoom = (id) => {
	if (rooms.has(id))
		throw new Error('Game already exists');

	const room = new Game(id, null);

	rooms.set(id, room);
	return room;
}

const broadcastRoom = (room) => {
	const clients = [...room.clients];

	clients.forEach(client => {
		client.emit(outgoingEvents.ROOM_BROADCAST, JSON.stringify({
			room: room.id,
			you: client.id,
			clients: clients.map(c => ({
				id: c.id,
				username: c.username
			}))
		}))
	})
}

const joinRoom = (socket, room, client) => {
	try {
		const roomName = room.id;

		room.playerJoin(client);

		socket.join(roomName);
		socket.emit(outgoingEvents.ROOM_JOINED, JSON.stringify({
			roomName: roomName
		}));

		broadcastRoom(room);
		console.log(`[${client.id}] Joined room ${roomName}`);
	} catch (error) {
		socket.emit(outgoingEvents.ERROR, JSON.stringify({
			message: error.message
		}));
	}
}

const leaveRoom = (socket, room, client) => {
	try {
		room.playerLeave(client);
		socket.leave(room.id);

		broadcastRoom(room);

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

const getRoom = (id) => rooms.get(id);

io.on("connection", (socket) => {
	const client = new Player(socket, socket.id);

	console.log("A user connected");

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

	socket.on(incomingEvents.ROOM_JOIN, (data) => {
		const roomName = data.roomName;

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

		const room = getRoom(roomName);

		if (!room) {
			try {
				const room = createRoom(roomName);

				room.playerJoin(client);
				room.assignOwner(client);

				socket.join(roomName);
				socket.emit(outgoingEvents.ROOM_CREATED, JSON.stringify({
					roomName: roomName
				}));
			} catch (error) {
				socket.emit(outgoingEvents.ERROR, JSON.stringify({
					message: error.message
				}));
			}
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

	socket.on(incomingEvents.START_GAME, () => {
		const room = client.room;

		if (!room) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Not in a room'
			}));
			return;
		}

		if (room.status === gameStatus.PLAYING) {
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

		room.start();
	});

	socket.on(incomingEvents.RESTART_GAME, () => {
		const room = client.room;

		if (!room) {
			socket.emit(outgoingEvents.ERROR, JSON.stringify({
				message: 'Not in a room'
			}));
			return;
		}

		if (room.status === gameStatus.PLAYING) {
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

	socket.on("disconnect", () => {
		const room = client.room;

		if (room) {
			leaveRoom(socket, room, client);
		}

		console.log("A user disconnected");
	});
});

httpServer.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}/`);
});
