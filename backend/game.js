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
		this.soloJourney = false;
		this.updateInterval = null;
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

		if (this.status == gameStatus.PLAYING)
			this.shouldEndGame();
	}

	shouldEndGame() {
		if (this.clients.length === 0) return true;

		const clients = [...this.clients];

		if (this.soloJourney) {
			if (clients.length === 1) {
				if (clients[0].hasLost) {
					return true;
				}
			}
		} else {
			const losers = clients.filter(client => client.hasLost);

			if (losers.length === clients.length - 1) {
				const winner = clients.find(client => !client.hasLost);

				clients.forEach(client => {
					client.sendGameOver(winner.id === client.id ? 'You win!' : 'You lose!');
				});

				return true;
			}
		}

		return false;
	}

	startInterval() {
		if (this.updateInterval)
			return;

		this.updateInterval = setInterval(() => {
			const clients = [...this.clients];

			if (this.shouldEndGame()) {
				console.log('[' + this.id + '] GAME OVER');
				this.stop();
				return;
			}

			console.log('[' + this.id + '] GAME TICK');

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
		this.soloJourney = clients.length === 1;
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

	restart() {
		if (this.status !== gameStatus.FINISHED)
			throw new Error('Game is not finished');

		const clients = [...this.clients];

		clients.forEach(client => client.reset());

		this.status = gameStatus.WAITING;
		this.start();
	}

	stop() {
		if (this.updateInterval)
			clearInterval(this.updateInterval);
		this.updateInterval = null;

		this.clients.forEach(client => {
			client.sendGameOver();
		});

		this.status = gameStatus.FINISHED;

		console.log('[' + this.id + '] GAME STOPPED');
	}

	handlePieceMove(client, direction) {
		if (this.status !== gameStatus.PLAYING)
			throw new Error('Game is not in progress');
		if (!client.currentPiece)
			throw new Error('Client has no current piece');

		client.movePiece(direction);
	}

	handlePenalties(author, penalties) {
		if (this.soloJourney)
			return;
		if (this.status !== gameStatus.PLAYING)
			throw new Error('Game is not in progress');

		const clients = [...this.clients].filter(client => client !== author);

		clients.forEach(client => {
			client.penalize(penalties);
			client.sendGrid();
		});
	}

}

module.exports = Game;
