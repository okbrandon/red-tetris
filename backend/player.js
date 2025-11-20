/**
 * @fileoverview Player class for managing player state and interactions in the game.
 * This class handles player connections, game state updates, piece movements,
 * and game over conditions.
 */

import gameSettings from './constants/game-settings.js';
import outgoingEvents from './constants/outgoing-events.js';
import incomingEvents from './constants/incoming-events.js';
import gameModes from './constants/game-modes.js';
import gameStatus from './constants/game-status.js';
import Statistics from './statistics.js';

class Player {

	/**
	 * @param {Socket} connection - The player's socket connection.
	 * @param {string} id - Unique player ID.
	 * @param {string|null} [username=null] - Optional username.
	 */
	constructor(connection, id, username = null) {
		this.connection = connection;
		this.id = id;
		this.username = username;
		this.room = null;
		this.pieces = new Set;
		this.currentPiece = null;
		this.currentPieceIndex = 0;
		this.grid = null;
		this.hasLost = false;
		this.score = 0;
		this.statistics = null;
		this.rateLimiters = {
			[incomingEvents.MOVE_PIECE]: {
				lastCalled: 0,
				cooldown: 20, // ms
			},
			[incomingEvents.PIECE_SPAWN]: {
				lastCalled: 0,
				cooldown: 150, // ms
			}
		}
	}

	/**
	 * Updates the player's username and reloads statistics.
	 * @param {*} username - New username.
	 */
	updateUsername(username) {
		if (typeof username !== 'string' || username.trim().length === 0) {
			throw new Error('Invalid username');
		}
		if (username.length > 16 || !gameSettings.NAME_VALIDATION_REGEX.test(username)) {
			throw new Error('Username must be alphanumeric and up to 16 characters long');
		}

		this.username = username;
		this.statistics = new Statistics(this.username);
		this.statistics.load().then(() => {
			console.log('Loaded statistics for', this.username);
			this.sendPlayerStatsBoard();
		}).catch((err) => {
			console.error('Failed to load statistics for', this.username, err);
		});
	}

	/**
	 * Sends a raw message to the player's socket.
	 * @param {*} message
	 */
	send(message) {
		this.connection.send(message);
	}

	/**
	 * Emits a socket event to the client.
	 * @param {string} event - Event name.
	 * @param {*} data - Event data.
	 */
	emit(event, data) {
		this.connection.emit(event, data);
	}

	/**
	 * Sends the current game state to the player.
	 */
	sendGrid() {
		const gridClone = structuredClone(this.grid);
		const gridWithoutCurrent = this.removePieceFromGrid(this.currentPiece, gridClone);
		const gridWithGhost = this.mergePieceIntoGrid(this.getGhostPiece(gridWithoutCurrent), gridWithoutCurrent, true);
		const finalGrid = (this.room.mode === gameModes.INVISIBLE_FALLING_PIECES ?
			gridWithGhost : this.mergePieceIntoGrid(this.currentPiece, gridWithGhost)
		);

		const nextPiecesData = Array.from(this.pieces)
			.slice(this.currentPieceIndex % this.pieces.size, this.currentPieceIndex % this.pieces.size + 3)
			.map(({ shape, color, position }) => ({ shape, color, position }));

		const clients = [...this.room.clients].filter(client => client !== this);
		const clientsData = clients.map(client => ({
			id: client.id,
			username: client.username,
			hasLost: client.hasLost,
			score: client.score,
			specter: client.getLandSpecter()
		}));

		this.emit(outgoingEvents.GAME_STATE, {
			room: {
				id: this.room.id,
				owner: {
					id: this.room.owner.id,
					username: this.room.owner.username,
					score: this.room.owner.score,
					hasLost: this.room.owner.hasLost
				},
				status: this.room.status,
				soloJourney: this.room.soloJourney,
				maxPlayers: this.room.maxPlayers,
				mode: this.room.mode
			},
			grid: finalGrid,
			currentPiece: this.currentPiece,
			nextPieces: nextPiecesData,
			you: {
				id: this.id,
				username: this.username,
				hasLost: this.hasLost,
				specter: this.getLandSpecter(),
				score: this.score
			},
			clients: clientsData
		});
	}

	/**
	 * Triggers game over for this player.
	 * @param {string} [message='Game Over'] - Reason for game over.
	 */
	sendGameOver(message = 'Game Over') {
		console.log('Client ' + this.username + ' has received game over. (' + message + ')');

		const clients = [...this.room.clients];
		const winner = this.room.getWinner();
		const gameResult = {
			room: {
				id: this.room.id,
				owner: {
					id: this.room.owner.id,
					username: this.room.owner.username,
					score: this.room.owner.score,
					hasLost: this.room.owner.hasLost
				},
				status: this.room.status,
				soloJourney: this.room.soloJourney,
				maxPlayers: this.room.maxPlayers,
				mode: this.room.mode
			},
			winner: winner ? {
				id: winner.id,
				username: winner.username,
				score: winner.score,
				hasLost: winner.hasLost
			} : null,
			you: {
				id: this.id,
				username: this.username,
				hasLost: this.hasLost,
				score: this.score
			},
			clients: clients.map(client => ({
				id: client.id,
				username: client.username,
				hasLost: client.hasLost,
				score: client.score
			})),
			message: message,
		};

		this.emit(outgoingEvents.GAME_OVER, {
			...gameResult
		});
		this.saveStatistics(gameResult);
	}

	/**
	 * Triggers game lost for this player.
	 * @param {string} [message='You have lost the game'] - Reason for losing the game.
	 */
	sendGameLost(message = 'You have lost the game') {
		if (this.hasLost)
			return;

		console.log('Client ' + this.username + ' has lost. (' + message + ')');
		this.hasLost = true;
		if (this.room)
			this.room.cancelPlayerTick(this);
		this.emit(outgoingEvents.GAME_LOST, {
			room: {
				id: this.room.id,
				owner: {
					id: this.room.owner.id,
					username: this.room.owner.username,
					score: this.room.owner.score,
					hasLost: this.room.owner.hasLost
				},
				status: this.room.status,
				soloJourney: this.room.soloJourney,
				maxPlayers: this.room.maxPlayers,
				mode: this.room.mode
			},
			you: {
				id: this.id,
				username: this.username,
				hasLost: this.hasLost,
				score: this.score,
				specter: this.getLandSpecter()
			},
			message: message,
		});
	}

	/**
	 * Sends the player's statistics board.
	 * Requires that statistics have been loaded.
	 */
	sendPlayerStatsBoard() {
		if (!this.statistics) {
			console.log('No statistics instance for', this.username);
			return;
		}

		this.emit(outgoingEvents.PLAYER_STATS_BOARD, {
			gameHistory: this.statistics.getStats()
		});
	}

	/**
	 * Retrieves the next piece from the queue.
	 * @returns {Piece|null} - The next piece or null if no pieces are available.
	 */
	nextPiece() {
		if (this.pieces.size === 0)
			return null;

		const nextPieceIndex = this.currentPieceIndex % this.pieces.size;
		const piece = Array.from(this.pieces)[nextPieceIndex];
		this.currentPieceIndex++;

		return piece;
	}

	/**
	 * Calculates ghost piece for UI visualization.
	 * @param {Array<Array<Object>>} gridWithoutCurrent - Grid without the current piece.
	 * @returns {Piece|null} - The ghost piece or null if no current piece.
	 */
	getGhostPiece(gridWithoutCurrent) {
		if (!this.currentPiece)
			return null;

		const ghostPiece = this.currentPiece.clone();
		const position = { ...ghostPiece.position };

		while (this.isValidMove(ghostPiece, gridWithoutCurrent, position)) {
			position.y++;
		}

		ghostPiece.position.y = position.y - 1;

		return ghostPiece;
	}

	/**
	 * Generates a gray overlay grid (land specter) for other players to see.
	 * @returns {Array<Array<Object>>} - The land specter grid.
	 */
	getLandSpecter() {
		if (!this.grid || !this.currentPiece)
			return gameSettings.DEFAULT_EMPTY_GRID;

		const gridWithoutCurrent = this.removePieceFromGrid(this.currentPiece, structuredClone(this.grid));

		gridWithoutCurrent.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (cell.filled) {
					gridWithoutCurrent[y][x] = {
						filled: true,
						color: 'gray',
						indestructible: cell.indestructible,
						ghost: false,
					};
				}
			});
		})

		return gridWithoutCurrent;
	}

	/**
	 * Initializes a new empty grid for the player.
	 */
	generateEmptyGrid() {
		this.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
	}

	/**
	 * Checks if a piece can legally move to a position.
	 * @param {Piece} piece - The piece to check.
	 * @param {Array<Array<Object>>} grid - The game grid.
	 * @param {{x: number, y: number}} position - The target position.
	 * @param {boolean} [rotate=false] - If true, check for rotated position.
	 * @returns {boolean} - True if the move is valid, false otherwise.
	 */
	isValidMove(piece, grid, position, rotate = false) {
		const shape = rotate ? piece.rotate() : piece.shape;
		const rows = this.room.rows;
		const cols = this.room.cols;

		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape[y].length; x++) {
				if (!shape[y][x]) continue;

				const gridX = position.x + x;
				const gridY = position.y + y;

				if (gridX < 0 || gridX >= cols || gridY >= rows) {
					return false;
				}

				if (gridY < 0)
					continue;

				if (grid[gridY][gridX]?.filled) {
					return false;
				}
			}
		}

		return true;
	}

	/**
	 * Modifies grid cells based on the provided piece and update function.
	 * @param {Piece} piece - The piece to update.
	 * @param {Array<Array<Object>>} grid - The game grid.
	 * @param {Function} updateCell - Function to update each cell.
	 * @returns {Array<Array<Object>>} - The updated grid.
	 */
	updatePieceOnGrid(piece, grid, updateCell) {
		const gridClone = structuredClone(grid);
		const shape = piece.shape;
		const rows = this.room.rows;
		const cols = this.room.cols;

		shape.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (cell) {
					const gridX = piece.position.x + x;
					const gridY = piece.position.y + y;

					if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {

						if (gridClone[gridY][gridX]?.indestructible)
							return;

						gridClone[gridY][gridX] = updateCell(piece);
					}
				}
			});
		});

		return gridClone;
	}

	/**
	 * Adds a piece to the grid.
	 * @param {Piece} piece - The piece to add.
	 * @param {Array<Array<Object>>} grid - The game grid.
	 * @param {boolean} [isGhost=false] - If true, treat the piece as a ghost.
	 * @returns {Array<Array<Object>>} - The updated grid.
	 */
	mergePieceIntoGrid(piece, grid, isGhost = false) {
		return this.updatePieceOnGrid(piece, grid, (piece) => ({
			filled: true,
			color: piece.color,
			indestructible: false,
			ghost: isGhost,
		}));
	}

	/**
	 * Removes a piece from the grid.
	 * @param {Piece} piece - The piece to remove.
	 * @param {Array<Array<Object>>} grid - The game grid.
	 * @returns {Array<Array<Object>>} - The updated grid.
	 */
	removePieceFromGrid(piece, grid) {
		return this.updatePieceOnGrid(piece, grid, () => ({
			filled: false,
			color: 'transparent',
			indestructible: false,
			ghost: false,
		}));
	}

	/**
	 * Adds penalty lines to the player's grid.
	 * @param {number} penalties - Number of lines to add.
	 */
	penalize(penalties) {
		if (!this.grid)
			return;

		const rows = this.room.rows;
		const cols = this.room.cols;

		const createPenaltyLine = () =>
			Array.from({ length: cols }, () => ({
				filled: true,
				color: 'gray',
				indestructible: true,
				ghost: false,
			}));

		const isPenaltyRow = row => row.every(cell => cell.indestructible);

		const gridForCalc = this.currentPiece
			? this.removePieceFromGrid(this.currentPiece, structuredClone(this.grid))
			: structuredClone(this.grid);

		const newPenalties = Array.from({ length: penalties }, createPenaltyLine);
		const existingPenalties = gridForCalc.filter(isPenaltyRow);
		const normalRows = gridForCalc.filter(row => !isPenaltyRow(row));

		const keepCount = Math.max(0, rows - newPenalties.length - existingPenalties.length);
		const keptNormalRows = keepCount === 0 ? [] : normalRows.slice(-keepCount);

		this.grid = [...keptNormalRows, ...existingPenalties, ...newPenalties].slice(-rows);
	}

	/**
	 * Clears all full lines and applies penalties to others.
	 */
	clearFullLines() {
		if (!this.grid)
			return;

		const rows = this.room.rows;
		const cols = this.room.cols;
		const newGrid = [];

		let clearedLines = 0;

		for (let y = 0; y < rows; y++) {
			const row = this.grid[y];
			const isFull = row.every(cell => cell.filled && !cell.indestructible);

			if (isFull) {
				clearedLines++;
			}
			else {
				newGrid.push(row);
			}
		}

		while (newGrid.length < rows) {
			newGrid.unshift(new Array(cols).fill({
				filled: false,
				color: 'transparent',
				indestructible: false,
				ghost: false,
			}));
		}

		this.grid = newGrid;

		if (clearedLines - 1 > 0)
			this.room.handlePenalties(this, clearedLines - 1);

		if (clearedLines > 0) {
			const bpsEntry = gameSettings.BPS_SCORING[clearedLines] || gameSettings.BPS_SCORING[4];
			const score = bpsEntry.points;
			const description = bpsEntry.description;

			this.score += score;
			this.room.broadcastLinesCleared(this, {
				clearedLines: clearedLines,
				scoredPoints: score,
				description: description
			});
			console.log(`Player ${this.username} cleared ${clearedLines} line(s) (${description}) for ${score} points. Total score: ${this.score}`);
		}
	}

	/**
	 * Finds the highest valid spawn position for a new piece.
	 * @param {Piece} piece - The piece to position.
	 * @param {Array<Array<Object>>} grid - The game grid to test against.
	 * @returns {{x: number, y: number}|null} - The first valid position from the top.
	 */
	findSpawnPosition(piece, grid) {
		if (!piece || !grid)
			return null;

		const spawnX = piece.position.x;
		const leadingEmptyRows = piece.getLeadingEmptyRows();
		const baseSpawnY = piece.position.y - leadingEmptyRows;
		const spawnAttempts = 3;

		for (let attempt = 0; attempt < spawnAttempts; attempt++) {
			const candidateY = baseSpawnY - attempt;
			const candidate = { x: spawnX, y: candidateY };

			if (this.isValidMove(piece, grid, candidate))
				return candidate;
		}

		return null;
	}

	/**
	 * Handles what happens when a piece lands.
	 */
	handlePieceLanding() {
		if (!this.currentPiece)
			return;

		const nextPiece = this.nextPiece();
		const rateLimiter = this.rateLimiters[incomingEvents.PIECE_SPAWN];

		this.clearFullLines();

		const spawnPosition = this.findSpawnPosition(nextPiece, this.grid);

		if (!spawnPosition) {
			this.sendGameLost('No space for next piece');
			return;
		}

		nextPiece.position = { ...spawnPosition };
		this.currentPiece = nextPiece;

		if (this.isValidMove(this.currentPiece, this.grid, this.currentPiece.position)) {
			this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
		}

		rateLimiter.lastCalled = Date.now();
		if (this.room && typeof this.room.schedulePlayerTick === 'function') {
			this.room.schedulePlayerTick(this);
		}
		this.sendGrid();
	}

	/**
	 * Moves, rotates, or drops the current piece.
	 * @param {'down' | 'left' | 'right' | 'up' | 'space'} [direction='down'] - The direction to move the piece.
	 */
	movePiece(direction = 'down') {
		if (!this.currentPiece || this.hasLost)
			return;

		const now = Date.now();
		const movePieceLimiter = this.rateLimiters[incomingEvents.MOVE_PIECE];
		const spawnPieceLimiter = this.rateLimiters[incomingEvents.PIECE_SPAWN];

		const { position } = this.currentPiece;
		let newPosition = { ...position };
		let rotate = false;
		let hardDrop = false;

		switch (direction) {
			case 'down':
				newPosition.y += 1;
				break;
			case 'left':
				newPosition.x -= 1;
				break;
			case 'right':
				newPosition.x += 1;
				break;
			case 'up':
				if (now - movePieceLimiter.lastCalled < movePieceLimiter.cooldown)
					return;
				rotate = true;
				break;
			case 'space':
				if (now - spawnPieceLimiter.lastCalled < spawnPieceLimiter.cooldown)
					return;
				hardDrop = true;
				break;
			default:
				return;
		}

		this.grid = this.removePieceFromGrid(this.currentPiece, this.grid);

		if (rotate) {
			const rotatedShape = this.currentPiece.rotate();
			const rotatedWidth = Array.isArray(rotatedShape[0]) ? rotatedShape[0].length : rotatedShape.length;
			const isNearWall = position.x < 1 || position.x + rotatedWidth > this.room.cols - 1;

			const tempPieceWithRotatedShape = { ...this.currentPiece, shape: rotatedShape };

			if (this.isValidMove(tempPieceWithRotatedShape, this.grid, position)) {
				this.currentPiece.shape = rotatedShape;
			} else {
				if (isNearWall) {
					const direction = position.x < 1 ? 1 : -1;

					for (let shifter = 1; shifter <= 3; shifter++) {
						const shiftX = direction * shifter;
						const shiftedPosition = { x: position.x + shiftX, y: position.y };

						if (this.isValidMove(tempPieceWithRotatedShape, this.grid, shiftedPosition)) {
							this.currentPiece.shape = rotatedShape;
							this.currentPiece.position.x += shiftX;
							break;
						}
					}
				}
			}
		}
		else if (hardDrop) {
			let y = position.y;

			while (this.isValidMove(this.currentPiece, this.grid, { ...position, y })) {
				y++;
			}

			this.currentPiece.position.y = y - 1;
			this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
			this.handlePieceLanding();
		}
		else {
			if (this.isValidMove(this.currentPiece, this.grid, newPosition)) {
				this.currentPiece.position = newPosition;
				this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
			}
			else {
				this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);

				if (direction === 'down') {
					this.handlePieceLanding();
				}
			}
		}

		movePieceLimiter.lastCalled = now;
		this.sendGrid();
	}

	/**
	 * Swaps the current piece with the next piece in the queue.
	 * Reverts if the swap results in an invalid position.
	 */
	swapWithNext() {
		if (!this.currentPiece || this.hasLost)
			return;
		if (!this.room || this.room.status !== gameStatus.IN_GAME)
			return;
		if (this.pieces.size === 0)
			return;

		const piecesArr = Array.from(this.pieces);
		const nextIndex = this.currentPieceIndex % this.pieces.size;
		const nextPiece = piecesArr[nextIndex];

		if (!nextPiece)
			return;

		const prevShape = this.currentPiece.shape;
		const prevColor = this.currentPiece.color;
		const nextShape = nextPiece.shape;
		const nextColor = nextPiece.color;

		this.grid = this.removePieceFromGrid(this.currentPiece, this.grid);
		this.currentPiece.shape = nextShape;
		this.currentPiece.color = nextColor;

		nextPiece.shape = prevShape;
		nextPiece.color = prevColor;

		// checking that the new current piece position is valid
		if (!this.isValidMove(this.currentPiece, this.grid, this.currentPiece.position)) {
			this.currentPiece.shape = prevShape;
			this.currentPiece.color = prevColor;

			nextPiece.shape = nextShape;
			nextPiece.color = nextColor;

			this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
			this.sendGrid();
			return;
		}

		this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
		this.sendGrid();
	}

	/**
	 * Advances the game by one tick.
	 */
	tickInterval() {
		if (!this.room) {
			console.log('No room to start interval');
			return;
		}

		if (this.hasLost) {
			this.sendGrid();
			return;
		}

		this.movePiece();
	}

	/**
	 * Saves game result to player statistics.
	 *
	 * @param {Object} gameResult - The game result to save.
	 */
	saveStatistics(gameResult) {
		if (!this.statistics) {
			console.log('No statistics instance for', this.username);
			return;
		}
		this.statistics.addGameResult({
			...gameResult,
			timestamp: new Date()
		});
		this.statistics.save().then(() => {
			console.log('Statistics saved for', this.username);
		}).catch((err) => {
			console.error('Failed to save statistics for', this.username, err);
		});
	}

	/**
	 * Resets the player's state.
	 */
	reset() {
		this.pieces.clear();
		this.currentPiece = null;
		this.currentPieceIndex = 0;
		this.grid = null;
		this.hasLost = false;
		this.score = 0;
	}

}

export default Player;
