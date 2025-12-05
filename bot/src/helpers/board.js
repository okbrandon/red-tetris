import { cloneShape, rotateShape, shapeKey, getFilledCells, getShapeBounds } from './shape.js';

export function getUniqueRotations(shape) {
	const rotations = [];
	let current = shape;

	for (let i = 0; i < 4; i++) {
		const key = shapeKey(current);
		if (!rotations.some(rotation => shapeKey(rotation) === key))
			rotations.push(cloneShape(current));
		current = rotateShape(current);
	}

	return rotations;
}

export function extractBoard(grid, currentPiece) {
	const height = grid.length;
	if (height === 0)
		return null;
	const width = Array.isArray(grid[0]) ? grid[0].length : 0;
	if (width === 0)
		return null;

	const occupancy = Array.from({ length: height }, () => Array(width).fill(false));
	const indestructible = Array.from({ length: height }, () => Array(width).fill(false));

	const currentCells = new Set();
	const pieceCells = getFilledCells(currentPiece.shape);
	pieceCells.forEach(({ x, y }) => {
		const boardX = currentPiece.position.x + x;
		const boardY = currentPiece.position.y + y;
		if (boardY >= 0)
			currentCells.add(`${boardX}:${boardY}`);
	});

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const cell = grid[y][x] || {};
			if (cell.ghost)
				continue;
			if (currentCells.has(`${x}:${y}`))
				continue;
			if (cell.filled) {
				occupancy[y][x] = true;
				indestructible[y][x] = Boolean(cell.indestructible);
			}
		}
	}

	return { occupancy, indestructible };
}

export function lockPiece(baseBoard, shape, posX, posY) {
	const height = baseBoard.occupancy.length;
	const width = baseBoard.occupancy[0]?.length || 0;
	const board = baseBoard.occupancy.map(row => row.slice());
	const indestructible = baseBoard.indestructible.map(row => row.slice());

	const cells = getFilledCells(shape);
	for (const cell of cells) {
		const x = posX + cell.x;
		const y = posY + cell.y;
		if (y < 0 || y >= height || x < 0 || x >= width)
			return { board: null, indestructible: null, linesCleared: 0 };
		board[y][x] = true;
		indestructible[y][x] = false;
	}

	let linesCleared = 0;
	const keptBoard = [];
	const keptIndestructible = [];

	for (let y = 0; y < height; y++) {
		const row = board[y];
		const rowIndestructible = indestructible[y];
		const hasIndestructible = rowIndestructible.some(Boolean);
		const isFull = row.every(Boolean);

		if (isFull && !hasIndestructible) {
			linesCleared++;
		} else {
			keptBoard.push(row);
			keptIndestructible.push(rowIndestructible);
		}
	}

	while (keptBoard.length < height) {
		keptBoard.unshift(Array(width).fill(false));
		keptIndestructible.unshift(Array(width).fill(false));
	}

	return {
		board: keptBoard,
		indestructible: keptIndestructible,
		linesCleared
	};
}

export function collides(board, shape, posX, posY) {
	const height = board.length;
	const width = board[0]?.length || 0;
	const cells = getFilledCells(shape);

	for (const cell of cells) {
		const x = posX + cell.x;
		const y = posY + cell.y;

		if (x < 0 || x >= width)
			return true;
		if (y >= height)
			return true;
		if (y >= 0 && board[y][x])
			return true;
	}

	return false;
}

export { getFilledCells, getShapeBounds };
