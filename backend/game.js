/**
 * @fileoverview Game class for managing game state and player interactions.
 */

import Tetromino from './tetromino.js';
import gameSettings from './constants/game-settings.js';
import gameStatus from './constants/game-status.js';
import outgoingEvents from './constants/outgoing-events.js';
import utils from './utils.js';

class Game {

	/**
	 * @param {string} id - Unique ID for the game room.
	 * @param {Object} [owner=null] - Initial owner of the game room.
	 * @param {boolean} [soloJourney=false] - Whether the game is in solo journey mode.
	 */
	constructor(id, owner = null, soloJourney = false) {
		/** @type {string} */
		this.id = soloJourney ? utils.randomString(5) + gameSettings.TAG_SINGLEPLAYER + id : id;
		/** @type {Object|null} */
		this.owner = owner;
		/** @type {string} */
		this.status = gameStatus.WAITING;
		/** @type {Set<Object>} */
		this.clients = new Set();
		/** @type {Map<string, any>} */
		this.grids = new Map();
		/** @type {number} */
		this.cols = gameSettings.FRAME_COLS;
		/** @type {number} */
		this.rows = gameSettings.FRAME_ROWS;
		/** @type {Tetromino} */
		this.tetromino = new Tetromino();
		/** @type {boolean} */
		this.soloJourney = soloJourney;
		/** @type {NodeJS.Timeout|null} */
		this.updateInterval = null;
		/** @type {number} */
		this.maxPlayers = soloJourney ? 1 : gameSettings.MAX_PLAYERS_PER_ROOM;
	}

	/**
	 * Assigns a client as the game owner.
	 * @param {Object} client
	 * @throws Will throw if the game already has an owner.
	 */
	assignOwner(client) {
		if (this.owner)
			throw new Error('Game already has an owner');

		this.owner = client;
	}

	/**
	 * Adds a player to the game.
	 * @param {Object} client
	 * @throws If the client is already in a room or game has started.
	 */
	playerJoin(client) {
		if (client.room)
			throw new Error('Client already in a room');
		if (this.status !== gameStatus.WAITING)
			throw new Error('Game has already started');
		if (this.soloJourney && client !== this.owner)
			throw new Error('Solo journey mode: only the owner can join');
		if (this.clients.size >= this.maxPlayers)
			throw new Error('Room is full');

		client.reset();
		client.room = this;
		this.clients.add(client);
	}

	/**
	 * Removes a player from the game.
	 * Handles game end logic and ownership transfer.
	 * @param {Object} client
	 */
	playerLeave(client) {
		if (client.room !== this)
			throw new Error('Client not in a room');

		client.reset();
		client.room = null;
		this.clients.delete(client);

		if (this.status == gameStatus.IN_GAME) {
			if (this.shouldEndGame()) {
				console.log('[' + this.id + '] GAME OVER (NO MORE PLAYERS)');
				this.stop();
				return;
			}
		}

		if (this.owner.id === client.id) {
			if (this.clients.size > 0) {
				this.owner = [...this.clients][0];
				this.broadcastRoom();
			}
		}
	}

	/**
	 * Sends updated room info to all clients.
	 */
	broadcastRoom() {
		const clients = [...this.clients];

		clients.forEach(client => {
			client.emit(outgoingEvents.ROOM_BROADCAST, JSON.stringify({
				room: this.id,
				owner: {
					id: this.owner.id,
					username: this.owner.username,
					hasLost: this.owner.hasLost,
					score: this.owner.score
				},
				you: {
					id: client.id,
					username: client.username,
					hasLost: client.hasLost,
					score: client.score
				},
				clients: clients.map(c => ({
					id: c.id,
					username: c.username,
					hasLost: c.hasLost,
					score: c.score
				}))
			}));
		});
	}

	/**
	 * Broadcasts a lines cleared event to all clients when a player clears lines.
	 *
	 * @param {Object} author - The player who cleared the lines.
	 * @param {Object} details - Details about the cleared lines.
	 * 	@property {number} clearedLines - Number of lines cleared.
	 * 	@property {number} scoredPoints - Points scored for clearing lines.
	 * 	@property {string} description - Description of the event.
	 */
	broadcastLinesCleared(author, details) {
		const clients = [...this.clients];

		clients.forEach(client => {
			client.emit(outgoingEvents.LINES_CLEARED, JSON.stringify({
				room: this.id,
				you: {
					id: client.id,
					username: client.username,
					score: client.score
				},
				scorer: {
					id: author.id,
					username: author.username,
					score: author.score
				},
				details: details
			}));
		});
	}

	/**
	 * Determines if the game should end based on player state.
	 * @returns {boolean}
	 */
	shouldEndGame() {
		if (this.status === gameStatus.WAITING) return false;
		if (this.status === gameStatus.FINISHED) return true;
		if (this.clients.size === 0) return true;

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
				return true;
			}
		}

		return false;
	}

	/**
	 * Starts the game update tick loop.
	 */
	startInterval() {
		if (this.updateInterval)
			return;

		this.updateInterval = setInterval(() => {
			const clients = [...this.clients];

			if (this.shouldEndGame()) {
				console.log('[' + this.id + '] GAME OVER (END GAME CHECK)');
				this.stop();
				return;
			}

			console.log('[' + this.id + '] GAME TICK');

			clients.forEach(client => {
				client.tickInterval();
			});
		}, 1000);
	}

	/**
	 * Starts the game and sends initial state to all players.
	 * @throws If the game is already started.
	 */
	start() {
		if (this.status !== gameStatus.WAITING)
			throw new Error('Game has already started');
		const clients = [...this.clients];

		this.status = gameStatus.IN_GAME;
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
				you: {
					id: client.id,
					username: client.username,
					hasLost: client.hasLost,
					score: client.score
				},
				clients: clients.map(c => ({
					id: c.id,
					username: c.username,
					hasLost: c.hasLost,
					score: c.score
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

	/**
	 * Restarts the game after it's finished.
	 * @throws If the game is not finished.
	 */
	restart() {
		if (this.status !== gameStatus.FINISHED)
			throw new Error('Game is not finished');

		const clients = [...this.clients];

		clients.forEach(client => client.reset());

		this.status = gameStatus.WAITING;
		this.tetromino.reset();
		this.start();
	}

	/**
	 * Stops the game and notifies all players.
	 */
	stop() {
		if (this.updateInterval)
			clearInterval(this.updateInterval);
		this.updateInterval = null;
		this.status = gameStatus.FINISHED;

		this.clients.forEach(client => {
			client.sendGameOver();
		});

		console.log('[' + this.id + '] GAME STOPPED');
	}

	/**
	 * Handles a player's piece movement.
	 * @param {Object} client - The player moving a piece.
	 * @param {string} direction - Direction to move (e.g., 'left', 'right', 'down').
	 * @throws If the game isn't running or the player has no active piece.
	 */
	handlePieceMove(client, direction) {
		if (this.status !== gameStatus.IN_GAME)
			throw new Error('Game is not in progress');
		if (!client.currentPiece)
			throw new Error('Client has no current piece');

		client.movePiece(direction);
	}

	/**
	 * Sends penalties to other players (e.g. after line clears).
	 * @param {Object} author - The player causing the penalty.
	 * @param {number} penalties - Number of penalty lines to apply.
	 */
	handlePenalties(author, penalties) {
		if (this.soloJourney)
			return;
		if (this.status !== gameStatus.IN_GAME)
			throw new Error('Game is not in progress');

		const clients = [...this.clients].filter(client => client !== author);

		clients.forEach(client => {
			client.penalize(penalties);
			client.sendGrid();
		});
	}

}

export default Game;
