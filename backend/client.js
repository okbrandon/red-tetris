const outgoingEvents = require('./constants/outgoing-events.js');

class Client {

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
	}

	send(message) {
		this.connection.send(message);
	}

	emit(event, data) {
		this.connection.emit(event, data);
	}

	sendGrid() {
		const gridWithoutCurrent = this.removePieceFromGrid(this.currentPiece, structuredClone(this.grid));
		const ghost = this.getGhostPiece(gridWithoutCurrent);
		const gridWithGhost = this.mergePieceIntoGrid(ghost, gridWithoutCurrent, true);
		const finalGrid = this.mergePieceIntoGrid(this.currentPiece, gridWithGhost);

		this.emit(outgoingEvents.GAME_STATE, {
			grid: finalGrid,
			piece: this.currentPiece,
		});
	}

	sendGameOver() {
		if (this.hasLost)
			return;
		console.log('Client ' + this.username + ' has lost.');
		this.hasLost = true;
		this.emit(outgoingEvents.GAME_OVER, {
			message: 'Game Over',
		});
	}

	nextPiece() {
		if (this.pieces.size === 0)
			return null;

		const nextPieceIndex = this.currentPieceIndex % this.pieces.size;
		const piece = Array.from(this.pieces)[nextPieceIndex];
		this.currentPieceIndex++;

		return piece;
	}

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

	generateEmptyGrid() {
		const grid = new Array(this.room.rows);
		for (let i = 0; i < this.room.rows; i++) {
			grid[i] = new Array(this.room.cols).fill({
				filled: false,
				color: 'transparent',
				indestructible: false,
				ghost: false,
			});
		}
		this.grid = grid;
	}

	isValidMove(piece, grid, position, rotate = false) {
		const shape = rotate ? piece.rotate() : piece.shape;
		const rows = this.room.rows;
		const cols = this.room.cols;

		for (let y = 0; y < shape.length; y++) {
			for (let x = 0; x < shape[y].length; x++) {
				if (!shape[y][x]) continue;

				const gridX = position.x + x;
				const gridY = position.y + y;

				if (gridX < 0 || gridX >= cols || gridY < 0 || gridY >= rows) {
					return false;
				}

				if (grid[gridY][gridX]?.filled) {
					return false;
				}
			}
		}

		return true;
	}

	updatePieceOnGrid(piece, grid, updateCell) {
		const shape = piece.shape;
		const rows = this.room.rows;
		const cols = this.room.cols;

		shape.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (cell) {
					const gridX = piece.position.x + x;
					const gridY = piece.position.y + y;

					if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {

						if (grid[gridY][gridX]?.indestructible)
							return;

						grid[gridY][gridX] = updateCell(piece);
					}
				}
			});
		});

		return grid;
	}

	mergePieceIntoGrid(piece, grid, isGhost = false) {
		return this.updatePieceOnGrid(piece, grid, (piece) => ({
			filled: true,
			color: piece.color,
			indestructible: false,
			ghost: isGhost,
		}));
	}

	removePieceFromGrid(piece, grid) {
		return this.updatePieceOnGrid(piece, grid, () => ({
			filled: false,
			color: 'transparent',
			indestructible: false,
			ghost: false,
		}));
	}

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

		const newPenalties = Array.from({ length: penalties }, createPenaltyLine);
		const existingPenalties = this.grid.filter(isPenaltyRow);
		const normalRows = this.grid
			.filter(row => !isPenaltyRow(row))
			.slice(0, Math.max(0, rows - newPenalties.length - existingPenalties.length));

		this.grid = [...normalRows, ...existingPenalties, ...newPenalties].slice(-rows);
	}

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
	}

	handlePieceLanding() {
		if (!this.currentPiece)
			return;

		const nextPiece = this.nextPiece();
		const offsetY = nextPiece.getLeadingEmptyRows();

		this.clearFullLines();
		if (!this.isValidMove(nextPiece, this.grid, nextPiece.position)) {
			this.sendGameOver();
			return;
		}

		nextPiece.position.y -= offsetY;
		this.currentPiece = nextPiece;

		if (this.isValidMove(this.currentPiece, this.grid, this.currentPiece.position)) {
			this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
		}
		this.sendGrid();
	}

	movePiece(direction = 'down') {
		if (!this.currentPiece)
			return;

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
				rotate = true;
				break;
			case 'space':
				hardDrop = true;
				break;
			default:
				return;
		}

		this.grid = this.removePieceFromGrid(this.currentPiece, this.grid);

		if (rotate) {
			const rotatedShape = this.currentPiece.rotate();

			if (this.isValidMove(this.currentPiece, this.grid, position, true)) {
				this.currentPiece.shape = rotatedShape;
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

		if (!hardDrop) {
			this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
		}

		this.sendGrid();
	}

	tickInterval() {
		if (!this.room) {
			console.log('No room to start interval');
			return;
		}
		if (this.hasLost)
			return;

		this.movePiece();
	}

}

module.exports = Client;
