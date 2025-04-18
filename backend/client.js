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
		this.updateInterval = null;
	}

	send(message) {
		console.log('Sending message to client:', message);
		this.connection.send(message);
	}

	emit(event, data) {
		console.log('Emitting event:', event);
		this.connection.emit(event, data);
	}

	nextPiece() {
		if (this.pieces.size === 0)
			return null;

		const nextPieceIndex = this.currentPieceIndex % this.pieces.size;
		const piece = Array.from(this.pieces)[nextPieceIndex];
		this.currentPieceIndex++;

		return piece;
	}

	generateEmptyGrid() {
		const grid = new Array(this.room.rows);
		for (let i = 0; i < this.room.rows; i++) {
			grid[i] = new Array(this.room.cols).fill({
				filled: false,
				color: 'transparent',
			});
		}
		this.grid = grid;
	}

	isValidMove(piece, grid, position, direction = 'down') {
		const shape = piece.shape;
		const rows = this.room.rows;
		const cols = this.room.cols;

		if (direction === 'down') {
			for (let y = 0; y < shape.length; y++) {
				const row = shape[y];
				for (let x = 0; x < row.length; x++) {
					const cell = row[x];
					if (cell) {
						const gridX = position.x + x;
						const gridY = position.y + y;

						if (gridY >= rows || gridY < 0 || gridX >= cols || gridX < 0) {
							return false;
						}
						if (gridY < rows && grid[gridY][gridX] && grid[gridY][gridX].filled) {
							return false;
						}
					}
				}
			}
		}
		else if (direction === 'left') {
			for (let y = 0; y < shape.length; y++) {
				const row = shape[y];
				for (let x = 0; x < row.length; x++) {
					const cell = row[x];
					if (cell) {
						const gridX = position.x + x;
						const gridY = position.y + y;

						if (gridX < 0 || gridY >= rows || gridY < 0 || gridX >= cols) {
							return false;
						}
						if (gridY < rows && grid[gridY][gridX] && grid[gridY][gridX].filled) {
							return false;
						}
					}
				}
			}
		}
		else if (direction === 'right') {
			for (let y = 0; y < shape.length; y++) {
				const row = shape[y];
				for (let x = 0; x < row.length; x++) {
					const cell = row[x];
					if (cell) {
						const gridX = position.x + x;
						const gridY = position.y + y;

						if (gridX >= cols || gridY >= rows || gridY < 0 || gridX < 0) {
							return false;
						}
						if (gridY < rows && grid[gridY][gridX] && grid[gridY][gridX].filled) {
							return false;
						}
					}
				}
			}
		}
		else if (direction === 'up') { // Piece rotation
			const rotatedShape = piece.rotate();

			for (let y = 0; y < rotatedShape.length; y++) {
				const row = rotatedShape[y];
				for (let x = 0; x < row.length; x++) {
					const cell = row[x];
					if (cell) {
						const gridX = position.x + x;
						const gridY = position.y + y;

						if (gridY >= rows || gridY < 0 || gridX >= cols || gridX < 0) {
							return false;
						}
						if (gridY < rows && grid[gridY][gridX] && grid[gridY][gridX].filled) {
							return false;
						}
					}
				}
			}
		}

		return true;
	}

	mergePieceIntoGrid(piece, grid) {
		const shape = piece.shape;
		const cols = this.room.cols;
		const rows = this.room.rows;

		shape.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    const gridX = piece.position.x + x;
                    const gridY = piece.position.y + y;

					if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
						grid[gridY][gridX] = {
							filled: true,
							color: piece.color,
						};
                    }
                }
            });
        });
		return grid;
	}

	removePieceFromGrid(piece, grid) {
		const shape = piece.shape;
		const rows = this.room.rows;
		const cols = this.room.cols;

		shape.forEach((row, y) => {
			row.forEach((cell, x) => {
				if (cell) {
					const gridX = piece.position.x + x;
					const gridY = piece.position.y + y;

					if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
						grid[gridY][gridX] = {
							filled: false,
							color: 'transparent',
						};
					}
				}
			});
		});
		return grid;
	}

	sendGrid() {
		this.emit(outgoingEvents.GAME_STATE, {
			grid: this.grid,
			piece: this.currentPiece,
		});
	}

	clearFullLines() {
		if (!this.grid)
			return;

		const rows = this.room.rows;
		const cols = this.room.cols;
		let clearedLines = 0;

		for (let y = 0; y < rows; y++) {
			let fullLine = true;

			for (let x = 0; x < cols; x++) {
				if (!this.grid[y][x].filled) {
					fullLine = false;
					break;
				}
			}

			if (fullLine) {
				this.grid.splice(y, 1);
				this.grid.unshift(new Array(cols).fill({
					filled: false,
					color: 'transparent',
				}));
				clearedLines++;
			}
		}

		console.log(`Cleared ${clearedLines} lines`);
	}

	handlePieceLanding() {
		if (!this.currentPiece)
			return;

		const nextPiece = this.nextPiece();
		const offsetY = nextPiece.getLeadingEmptyRows();

		this.clearFullLines();
		if (!this.isValidMove(nextPiece, this.grid, nextPiece.position)) {
			if (this.updateInterval)
				clearInterval(this.updateInterval);
			console.log('Game Over for player ' + this.username);
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
		if (!this.currentPiece) {
			console.log('No current piece to move down');
			return;
		}

		console.log(this.currentPiece.shape);

		if (direction === 'down') {
			const newPosition = { ...this.currentPiece.position,
				y: this.currentPiece.position.y + 1 };

			this.grid = this.removePieceFromGrid(this.currentPiece, this.grid);
			if (this.isValidMove(this.currentPiece, this.grid, newPosition)) {
				this.currentPiece.position = newPosition;
				this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
			} else {
				this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
				this.handlePieceLanding();
			}
		}
		else if (direction === 'left') {
			const newPosition = { ...this.currentPiece.position,
				x: this.currentPiece.position.x - 1 };

			this.grid = this.removePieceFromGrid(this.currentPiece, this.grid);
			if (this.isValidMove(this.currentPiece, this.grid, newPosition, 'left')) {
				this.currentPiece.position = newPosition;
			}
			this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
		}
		else if (direction === 'right') {
			const newPosition = { ...this.currentPiece.position,
				x: this.currentPiece.position.x + 1 };

			this.grid = this.removePieceFromGrid(this.currentPiece, this.grid);
			if (this.isValidMove(this.currentPiece, this.grid, newPosition, 'right')) {
				this.currentPiece.position = newPosition;
			}
			this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
		}
		else if (direction === 'up') {
			const rotatedShape = this.currentPiece.rotate();

			this.grid = this.removePieceFromGrid(this.currentPiece, this.grid);
			if (this.isValidMove(this.currentPiece, this.grid, this.currentPiece.position, 'up')) {
				this.currentPiece.shape = rotatedShape;
			}
			this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
		}
		else if (direction === 'space') {
			this.grid = this.removePieceFromGrid(this.currentPiece, this.grid);
			let y = this.currentPiece.position.y;

			while (true) {
				const newPosition = { ...this.currentPiece.position,
					y: y };

				if (this.isValidMove(this.currentPiece, this.grid, newPosition)) {
					y++;
				}
				else break;
			}
			this.currentPiece.position.y = y - 1;
			this.grid = this.mergePieceIntoGrid(this.currentPiece, this.grid);
			this.handlePieceLanding();
		}

		this.sendGrid();
	}

	startInterval() {
		if (!this.room) {
			console.log('No room to start interval');
			return;
		}
		if (this.updateInterval)
			clearInterval(this.updateInterval);

		this.updateInterval = setInterval(() => {
			this.movePiece();
		}, 1000);
	}

}

module.exports = Client;
