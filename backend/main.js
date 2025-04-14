const { createServer } = require("http")
const { Server } = require("socket.io")
const Client = require("./client");
const Game = require("./game");

const httpServer = createServer();
const io = new Server(httpServer, {});

const rooms = new Map;

const PORT = process.env.PORT || 3000;

const createRoom = (id) => {
	if (rooms.has(id))
		throw new Error('Game already exists');

	const room = new Game(id);

	rooms.set(id, room);
	return room;
}

const broadcastRoom = (room) => {
	const clients = [...room.clients];

	clients.forEach(client => {
		client.send(JSON.stringify({
			type: 'room-broadcast',
			room: room.id,
			you: client.id,
			clients: clients.map(c => ({
				id: c.id,
				username: c.username
			}))
		}))
	});
}

const getRoom = (id) => rooms.get(id);

io.on("connection", (socket) => {
	const client = new Client(socket, socket.id);

	console.log("A user connected");

	socket.on("message", (message) => {
		console.log('Message received:', message);

		if (typeof(message) !== 'object') {
			socket.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
			return;
		}

		const data = message;

		if (data.type === 'client-update') {
			if (!data.username) {
				socket.send(JSON.stringify({ type: 'error', message: 'Username is required' }));
				return;
			}

			client.username = data.username;
			socket.send(JSON.stringify({ type: 'client-update', id: client.id, username: client.username }));
			console.log(`[${client.id}] Updated username to ${client.username}`);
		}
		else if (data.type === 'room-join') {
			const roomName = data.roomName;

			if (!roomName) {
				socket.send(JSON.stringify({ type: 'error', message: 'Room name is required' }));
				return;
			}
			if (!client.username) {
				socket.send(JSON.stringify({ type: 'error', message: 'Username is required' }));
				return;
			}

			const room = getRoom(roomName);

			if (!room) {
				try {
					const room = createRoom(roomName);

					room.playerJoin(client);

					socket.join(roomName);
					socket.send(JSON.stringify({ type: 'room-created', roomName }));
				} catch (error) {
					socket.send(JSON.stringify({ type: 'error', message: error.message }));
				}
				return;
			}

			try {
				room.playerJoin(client);

				socket.join(roomName);
				socket.send(JSON.stringify({ type: 'room-joined', roomName }));

				broadcastRoom(room);
				console.log(`[${client.id}] Joined room ${roomName}`);
			} catch (error) {
				socket.send(JSON.stringify({ type: 'error', message: error.message }));
			}

			console.log(rooms);
		}
	});

	socket.on("disconnect", () => {
		const room = client.room;

		if (room) {
			try {
				room.playerLeave(client);
				socket.leave(room.id);

				broadcastRoom(room);

				if (room.clients.size === 0) {
					console.log(`Deleting room ${room.id}`);
					rooms.delete(room.id);
				}

				socket.send(JSON.stringify({ type: 'room-left', roomName: room.id }));
				console.log(`[${client.id}] Left room ${room.id}`);
			} catch (error) {
				socket.send(JSON.stringify({ type: 'error', message: error.message }));
			}
		}

		console.log("A user disconnected");
	});
});

httpServer.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}/`);
});
