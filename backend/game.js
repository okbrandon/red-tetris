const Tetromino = require('./tetromino.js')
const outgoingEvents = require('./constants/outgoing-events.js')
const gameStatus = require('./constants/game-status.js')
const gameSettings = require('./constants/game-settings.js')

class Game {

	constructor(id, owner = null) {
		this.id = id;
		this.owner = owner;
		this.status = gameStatus.WAITING;
		this.clients = new Set;
		this.grids = new Map;
		this.cols = gameSettings.FRAME_COLS;
		this.rows = gameSettings.FRAME_ROWS;
		this.tetromino = new Tetromino();
	}

	assignOwner(client) {
		if (this.owner)
			throw new Error('Game already has an owner');

		this.owner = client;
	}

	playerJoin(client) {
		if (client.room)
			throw new Error('Client already in a room');

		client.room = this;
		this.clients.add(client);
	}

	playerLeave(client) {
		if (client.room !== this)
			throw new Error('Client not in a room');

		if (client.updateInterval)
			clearInterval(client.updateInterval);
		client.room = null;
		this.clients.delete(client);
	}

	start() {
		if (this.status !== gameStatus.WAITING)
			throw new Error('Game has already started');
		const clients = [...this.clients];

		this.status = gameStatus.PLAYING;
		this.tetromino.generate(gameSettings.DEFAULT_PIECE_COUNT);

		clients.forEach(client => {
			this.tetromino.pieces.forEach(piece => {
				client.pieces.add(piece.clone());
			});

			const nextPiece = client.nextPiece();
			const offsetY = nextPiece.getLeadingEmptyRows();

			nextPiece.position.y -= offsetY;
			client.currentPiece = nextPiece;

			client.generateEmptyGrid();
			client.sendGrid();
			client.startInterval();

			client.emit(outgoingEvents.GAME_STARTED, JSON.stringify({
				room: this.id,
				you: client.id,
				clients: clients.map(c => ({
					id: c.id,
					username: c.username
				})),
				pieces: [...client.pieces].map(piece => ({
					shape: piece.shape,
					color: piece.color,
					position: piece.position
				})),
			}))
		});
	}

	handlePieceMove(client, direction) {
		if (this.status !== gameStatus.PLAYING)
			throw new Error('Game is not in progress');
		if (!client.currentPiece)
			throw new Error('Client has no current piece');

		client.movePiece(direction);
	}

}

module.exports = Game;
