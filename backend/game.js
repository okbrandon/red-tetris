/**
 * @fileoverview Game class for managing game state and player interactions.
 */

import Tetromino from './tetromino.js';
import gameSettings from './constants/game-settings.js';
import gameStatus from './constants/game-status.js';
import outgoingEvents from './constants/outgoing-events.js';
import utils from './utils.js';
import gameModes from './constants/game-modes.js';

class Game {

	/**
	 * @param {string} id - Unique ID for the game room.
	 * @param {Object} [owner=null] - Initial owner of the game room.
	 * @param {boolean} [soloJourney=false] - Whether the game is in solo journey mode.
	 * @param {string} [mode=gameModes.CLASSIC] - The game mode to use.
	 */
	constructor(id, owner = null, soloJourney = false, mode = gameModes.CLASSIC) {
		// Room setup
		const roomId = soloJourney
			? utils.randomString(5) + gameSettings.TAG_SINGLEPLAYER + id
			: id;

		/** @type {string} */
		this.id = roomId;
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
		this.soloJourney = Boolean(soloJourney);
		/** @type {NodeJS.Timeout|null} */
		this.updateInterval = null;
		/** @type {number} */
		this.maxPlayers = this.soloJourney ? 1 : gameSettings.MAX_PLAYERS_PER_ROOM;
		/** @type {string} */
		this.mode = Object.values(gameModes).includes(mode) ? mode : gameModes.CLASSIC;

		// Ticking settings
		const isFastMode = this.mode === gameModes.FAST_PACED;

		/** @type {number} */
		this.tickingInterval = isFastMode ? 500 : 1000;
		/** @type {Map<string, number>} */
		this.playerTickSchedule = new Map();
		/** @type {Set<string>} */
		this.playersProcessingTick = new Set();
		/** @type {number} */
		this.morphingTickingInterval = 2000;
		/** @type {number} */
		this.ticks = 0;
	}

	/**
	 * Changes the game mode.
	 * @param {string} newMode - The new game mode to set.
	 * @throws Will throw an error if the new mode is invalid.
	 */
	changeMode(newMode) {
		if (!Object.values(gameModes).includes(newMode))
			throw new Error('Invalid game mode');

		this.mode = newMode;
		this.tickingInterval = this.mode === gameModes.FAST_PACED ? 500 : 1000;
		if (this.status === gameStatus.IN_GAME) {
			[...this.clients].forEach(client => {
				if (!client.hasLost)
					this.schedulePlayerTick(client);
			});
		}
		this.broadcastRoom();
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
		this.cancelPlayerTick(client);

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
				room: {
					id: this.id,
					owner: {
						id: this.owner.id,
						username: this.owner.username,
						hasLost: this.owner.hasLost,
						score: this.owner.score,
						level: this.owner.level,
						linesCleared: this.owner.totalLinesCleared
					},
					mode: this.mode,
					status: this.status,
					soloJourney: this.soloJourney,
					maxPlayers: this.maxPlayers,
				},
				you: {
					id: client.id,
					username: client.username,
					hasLost: client.hasLost,
					score: client.score,
					level: client.level,
					linesCleared: client.totalLinesCleared
				},
				clients: clients.map(c => ({
					id: c.id,
					username: c.username,
					hasLost: c.hasLost,
					score: c.score,
					level: c.level,
					linesCleared: c.totalLinesCleared
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
				room: {
					id: this.id,
					owner: {
						id: this.owner.id,
						username: this.owner.username,
						hasLost: this.owner.hasLost,
						score: this.owner.score,
						level: this.owner.level,
						linesCleared: this.owner.totalLinesCleared
					},
					mode: this.mode,
					status: this.status,
					soloJourney: this.soloJourney,
					maxPlayers: this.maxPlayers,
				},
				you: {
					id: client.id,
					username: client.username,
					score: client.score,
					level: client.level,
					linesCleared: client.totalLinesCleared
				},
				scorer: {
					id: author.id,
					username: author.username,
					score: author.score,
					level: author.level,
					linesCleared: author.totalLinesCleared
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

			// All players lost
			if (losers.length === clients.length) {
				return true;
			}
			// Only one player left
			if (losers.length === clients.length - 1) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Schedules the next automatic tick for a player.
	 * @param {Object} client - The player to schedule.
	 * @param {number} [delay] - Optional delay override in milliseconds.
	 */
	schedulePlayerTick(client, delay = undefined) {
		if (!client || !client.id)
			return;
		if (!this.clients.has(client)) {
			this.playerTickSchedule.delete(client.id);
			return;
		}
		if (this.status !== gameStatus.IN_GAME) {
			this.playerTickSchedule.delete(client.id);
			return;
		}

		let resolvedDelay;
		if (typeof delay === 'number') {
			resolvedDelay = delay;
		} else {
			resolvedDelay = client.getGravityDelay(this.mode);
		}

		if (!Number.isFinite(resolvedDelay))
			resolvedDelay = this.tickingInterval;

		const safeDelay = Math.max(0, Number(resolvedDelay) || 0);
		this.playerTickSchedule.set(client.id, Date.now() + safeDelay);
	}

	/**
	 * Removes any scheduled tick for the given player.
	 * @param {Object} client - The player whose schedule is cleared.
	 */
	cancelPlayerTick(client) {
		if (!client || !client.id)
			return;
		this.playerTickSchedule.delete(client.id);
		this.playersProcessingTick.delete(client.id);
	}

	/**
	 * Starts the game update tick loop.
	 */
	startInterval() {
		if (this.updateInterval)
			return;

		this.updateInterval = setInterval(() => {
			if (this.shouldEndGame()) {
				console.log('[' + this.id + '] GAME OVER (END GAME CHECK)');
				this.stop();
				return;
			}

			const now = Date.now();
			const clients = [...this.clients];

			for (const client of clients) {
				if (!client)
					continue;

				let nextTickAt = this.playerTickSchedule.get(client.id);
				if (!nextTickAt) {
					this.schedulePlayerTick(client, 0);
					nextTickAt = this.playerTickSchedule.get(client.id);
				}
				if (!nextTickAt || now < nextTickAt)
					continue;
				if (this.playersProcessingTick.has(client.id))
					continue;

				this.playersProcessingTick.add(client.id);

				setImmediate(async () => {
					try {
						if (!this.clients.has(client) || this.status !== gameStatus.IN_GAME)
							return;
						console.log('[' + this.id + '] PLAYER ' + client.username + ' LVL (' + client.level + ') CL (' + client.totalLinesCleared + ') GAME TICK (' + this.ticks + ')');
						await Promise.resolve().then(() => client.tickInterval());
					} finally {
						this.playersProcessingTick.delete(client.id);
						if (this.status === gameStatus.IN_GAME && this.clients.has(client)) {
							this.schedulePlayerTick(client);
						} else {
							this.playerTickSchedule.delete(client.id);
						}
					}
				});
			}

			if (this.ticks > 0
				&& this.mode === gameModes.MORPH_FALLING_PIECES
				&& this.ticks % this.morphingTickingInterval === 0) {
				console.log('[' + this.id + '] MORPHING PIECES TICK (' + this.ticks + ')');
				clients.forEach(client => {
					client.swapWithNext();
				});
			}

			this.ticks += 1;
		}, 1);
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
				room: {
					id: this.id,
					owner: {
						id: this.owner.id,
						username: this.owner.username,
						hasLost: this.owner.hasLost,
						score: this.owner.score,
						level: this.owner.level,
						linesCleared: this.owner.totalLinesCleared
					},
					mode: this.mode,
					status: this.status,
					soloJourney: this.soloJourney,
					maxPlayers: this.maxPlayers,
				},
				you: {
					id: client.id,
					username: client.username,
					hasLost: client.hasLost,
					score: client.score,
					level: client.level,
					linesCleared: client.totalLinesCleared
				},
				clients: clients.map(c => ({
					id: c.id,
					username: c.username,
					hasLost: c.hasLost,
					score: c.score,
					level: c.level,
					linesCleared: c.totalLinesCleared
				})),
				pieces: [...client.pieces].map(piece => ({
					shape: piece.shape,
					color: piece.color,
					position: piece.position
				})),
			}))

			client.sendGrid();
			this.schedulePlayerTick(client);
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

		this.playerTickSchedule.clear();
		this.playersProcessingTick.clear();

		const clients = [...this.clients];

		this.status = gameStatus.WAITING;
		this.tetromino.reset();

		clients.forEach(client => {
			client.reset();
			client.emit(outgoingEvents.GAME_RESTORED, JSON.stringify({
				room: {
					id: this.id,
					owner: {
						id: this.owner.id,
						username: this.owner.username,
						hasLost: this.owner.hasLost,
						score: this.owner.score
					},
					mode: this.mode,
					status: this.status,
					soloJourney: this.soloJourney,
					maxPlayers: this.maxPlayers,
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
			}))
		});
	}

	/**
	 * Stops the game and notifies all players.
	 */
	stop() {
		if (this.updateInterval)
			clearInterval(this.updateInterval);
		this.updateInterval = null;
		this.playerTickSchedule.clear();
		this.playersProcessingTick.clear();
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

	/**
	 * Determines the winner of the game, if any.
	 * @returns {Object|null} The winning player or null if no winner.
	 */
	getWinner() {
		if (this.status !== gameStatus.FINISHED)
			return null;

		if (this.soloJourney) {
			const client = [...this.clients][0];
			return client.hasLost ? null : client;
		} else {
			const clients = [...this.clients];
			const winners = clients.filter(client => !client.hasLost);

			if (winners.length === 1)
				return winners[0];
			return null;
		}
	}

}

export default Game;
