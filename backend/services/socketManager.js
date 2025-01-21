class SocketManager {
	constructor(io) {
		this.io = io;

		this.listener();
	}

	listener() {
		this.io.on('connection', socket => {
			this.connectionHandler(socket);

			socket.on('message', data => {
				if (typeof(data) !== 'object') {
					socket.emit('message', {
						"type": "ERROR",
						"message": "Invalid JSON"
					});
					return;
				}

				this.messageHandler(socket, data);
			});

			socket.on('disconnect', () => {
				this.disconnectionHandler(socket);
			});
		});
	}

	connectionHandler(socket) {
		console.log(`${socket.id} connected`);
	}

	disconnectionHandler(socket) {
		console.log(`${socket.id} disconnected`);
	}

	messageHandler(socket, data) {
		console.log(`Received message from ${socket.id}: `, data);
	}

}

module.exports = SocketManager;
