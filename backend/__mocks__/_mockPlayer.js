import { jest } from '@jest/globals';

export function createMockPlayer({ id = 'p1', hasLost = false, room = null } = {}) {
	return {
		id,
		username: 'TestUser',
		room,
		hasLost,
		pieces: new Set(),
		currentPiece: {},
		reset: jest.fn(),
		emit: jest.fn(),
		sendGameOver: jest.fn(),
		tickInterval: jest.fn(),
		generateEmptyGrid: jest.fn(),
		mergePieceIntoGrid: jest.fn((piece, grid) => grid),
		nextPiece: jest.fn(() => ({ position: { y: 0 }, getLeadingEmptyRows: jest.fn(() => 0) })),
		penalize: jest.fn(),
		sendGrid: jest.fn(),
		grid: [],
		currentPiece: { position: { y: 0 }, getLeadingEmptyRows: jest.fn(() => 0) },
		swapWithNext: jest.fn(),
	};
}
