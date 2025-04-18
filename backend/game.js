const Tetromino = require('./tetromino.js')
const outgoingEvents = require('./constants/outgoing-events.js')
const gameStatus = require('./constants/game-status.js')
const gameSettings = require('./constants/game-settings.js')

class Game {

	constructor(id, owner = null, endCallback) {
		this.id = id;
		this.owner = owner;
		this.status = gameStatus.WAITING;
		this.clients = new Set;
		this.grids = new Map;
		this.cols = gameSettings.FRAME_COLS;
		this.rows = gameSettings.FRAME_ROWS;
		this.tetromino = new Tetromino();
		this.updateInterval = null;
		this.endCallback = endCallback;
	}

	assignOwner(client) {
		if (this.owner)
			throw new Error('Game already has an owner');

		this.owner = client;
	}

	playerJoin(client) {
		if (client.room)
			throw new Error('Client already in a room');
		if (this.status !== gameStatus.WAITING)
			throw new Error('Game has already started');

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

	startInterval() {
		if (this.updateInterval)
			return;

		this.updateInterval = setInterval(() => {
			const clients = [...this.clients];

			if (clients.length === 0) {
				this.stop();
				this.endCallback(this);
				return;
			}

			clients.forEach(client => {
				client.tickInterval();
			});
		}, 1000);
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

			client.generateEmptyGrid();

			nextPiece.position.y -= offsetY;
			client.currentPiece = nextPiece;
			client.grid = client.mergePieceIntoGrid(nextPiece, client.grid, nextPiece.position);

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

			client.sendGrid();
		});

		this.startInterval();
	}

	stop() {
		if (this.updateInterval)
			clearInterval(this.updateInterval);
		this.updateInterval = null;

		this.clients.forEach(client => {
			client.sendGameOver();
		});

		this.status = gameStatus.FINISHED;
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
