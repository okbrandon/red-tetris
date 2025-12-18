import { getUniqueRotations, extractBoard, lockPiece, collides, getShapeBounds } from './helpers/board.js';
import { getFilledCells } from './helpers/shape.js';

export function evaluateBoard(board, indestructible, linesCleared, landingY, weights) {
	const height = board.length;
	const width = board[0]?.length || 0;

	const columnHeights = Array(width).fill(0);
	let holes = 0;

	for (let x = 0; x < width; x++) {
		let seenBlock = false;
		for (let y = 0; y < height; y++) {
			if (board[y][x]) {
				if (!seenBlock) {
					columnHeights[x] = height - y;
					seenBlock = true;
				}
			} else if (seenBlock && !indestructible[y][x]) {
				holes++;
			}
		}
	}

	const aggregateHeight = columnHeights.reduce((sum, h) => sum + h, 0);
	let bumpiness = 0;
	for (let x = 0; x < width - 1; x++) {
		bumpiness += Math.abs(columnHeights[x] - columnHeights[x + 1]);
	}
	const maxHeight = Math.max(...columnHeights, 0);
	const multiLineBonus = linesCleared >= 2
		? ((linesCleared * linesCleared) - 1) * (weights.multiClearBonus || 0)
		: 0;

	return (
		(linesCleared * weights.linesCleared)
		+ multiLineBonus
		- (aggregateHeight * weights.aggregateHeight)
		- (holes * weights.holes)
		- (bumpiness * weights.bumpiness)
		- (maxHeight * weights.maxHeight)
		- (Math.max(0, landingY) * weights.landingHeight)
	);
}

export function evaluateLookahead(board, indestructible, nextPieceTemplate, weights) {
	if (!nextPieceTemplate || !Array.isArray(nextPieceTemplate.shape))
		return 0;

	const rotations = getUniqueRotations(nextPieceTemplate.shape);
	if (!rotations.length)
		return 0;

	const height = board.length;
	const width = board[0]?.length || 0;
	const baseBoard = { occupancy: board, indestructible };
	let bestScore = null;
	const spawnY = -2;

	rotations.forEach((shape) => {
		const cells = getFilledCells(shape);
		const bounds = getShapeBounds(cells);
		const minX = -bounds.minX;
		const maxX = width - (bounds.maxX + 1);

		for (let posX = minX; posX <= maxX; posX++) {
			let posY = spawnY;

			if (collides(board, shape, posX, posY))
				continue;

			while (!collides(board, shape, posX, posY + 1)) {
				posY++;
				if (posY > height)
					break;
			}

			const placement = lockPiece(baseBoard, shape, posX, posY);
			if (!placement.board)
				continue;

			const score = evaluateBoard(placement.board, placement.indestructible, placement.linesCleared, posY, weights);
			if (bestScore === null || score > bestScore)
				bestScore = score;
		}
	});

	return bestScore ?? 0;
}

export function computeBestPlacement(gameState, options) {
	const grid = gameState.grid;
	const currentPiece = gameState.currentPiece;
	if (!Array.isArray(grid) || !currentPiece?.shape)
		return null;

	const baseBoard = extractBoard(grid, currentPiece);
	if (!baseBoard)
		return null;

	const rotations = getUniqueRotations(currentPiece.shape);
	if (!rotations.length)
		return null;

	const boardHeight = baseBoard.occupancy.length;
	const boardWidth = baseBoard.occupancy[0]?.length || 0;
	const spawnY = Math.min(currentPiece.position?.y ?? 0, 0);
	const nextPieceTemplate = Array.isArray(gameState.nextPieces) ? gameState.nextPieces[0] : null;
	const lookaheadWeight = options.lookaheadWeight || 0;

	let best = null;

	rotations.forEach((shape, rotationIndex) => {
		const cells = getFilledCells(shape);
		const bounds = getShapeBounds(cells);
		const minX = -bounds.minX;
		const maxX = boardWidth - (bounds.maxX + 1);

		for (let posX = minX; posX <= maxX; posX++) {
			let posY = spawnY;

			if (collides(baseBoard.occupancy, shape, posX, posY))
				continue;

			while (!collides(baseBoard.occupancy, shape, posX, posY + 1)) {
				posY++;
				if (posY > boardHeight)
					break;
			}

			const placement = lockPiece(baseBoard, shape, posX, posY);
			if (!placement.board)
				continue;

			const baseScore = evaluateBoard(
				placement.board,
				placement.indestructible,
				placement.linesCleared,
				posY,
				options.heuristicWeights
			);

			let totalScore = baseScore;
			if (nextPieceTemplate && lookaheadWeight > 0) {
				const lookaheadScore = evaluateLookahead(
					placement.board,
					placement.indestructible,
					nextPieceTemplate,
					options.heuristicWeights
				);
				totalScore += lookaheadScore * lookaheadWeight;
			}

			if (!best || totalScore > best.score) {
				best = {
					rotationIndex,
					x: posX,
					landingY: posY,
					score: totalScore,
					baseScore,
					rotations
				};
			}
		}
	});

	return best;
}
