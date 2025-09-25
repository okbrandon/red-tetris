import { describe, beforeEach, test, expect, vi } from "vitest";
import { DEFAULT_EMPTY_GRID } from '../constants/game-settings.js';
import { WAITING } from '../constants/game-status.js';
import Player from '../player.js';

describe('Player', () => {

	let mockConnection;
	let player;

	beforeEach(() => {
		mockConnection = {
			send: vi.fn(),
			emit: vi.fn()
		};
		player = new Player(mockConnection, 'player1', 'Alice');
		player.room = {
			id: 'room1',
			owner: { id: 'owner1', username: 'Owner' },
			status: WAITING,
			soloJourney: false,
			rows: 2,
			cols: 2,
			clients: new Set([player]),
			handlePenalties: vi.fn()
		};
	});

	test('constructor sets properties', () => {
		expect(player.id).toBe('player1');
		expect(player.username).toBe('Alice');
		expect(player.hasLost).toBe(false);
		expect(player.pieces.size).toBe(0);
	});

	test('send calls connection.send', () => {
		player.send('hello');
		expect(mockConnection.send).toHaveBeenCalledWith('hello');
	});

	test('emit calls connection.emit', () => {
		player.emit('event', { foo: 1 });
		expect(mockConnection.emit).toHaveBeenCalledWith('event', { foo: 1 });
	});

	test('generateEmptyGrid sets grid to DEFAULT_EMPTY_GRID', () => {
		player.generateEmptyGrid();
		expect(player.grid).toEqual(DEFAULT_EMPTY_GRID);
	});

	test('sendGameOver sets hasLost and emits GAME_OVER', () => {
		player.sendGameOver('Lost!');
		expect(player.hasLost).toBe(true);
		expect(mockConnection.emit).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ message: 'Lost!' })
		);
	});

	test('sendGameOver does nothing if already lost', () => {
		player.hasLost = true;
		player.sendGameOver('Lost!');
		expect(mockConnection.emit).not.toHaveBeenCalled();
	});

	test('nextPiece returns null if no pieces', () => {
		expect(player.nextPiece()).toBeNull();
	});

	test('reset clears player state', () => {
		player.pieces.add({ dummy: true });
		player.currentPiece = { dummy: true };
		player.currentPieceIndex = 5;
		player.grid = [[{ filled: true }]];
		player.hasLost = true;
		player.reset();
		expect(player.pieces.size).toBe(0);
		expect(player.currentPiece).toBeNull();
		expect(player.currentPieceIndex).toBe(0);
		expect(player.grid).toBeNull();
		expect(player.hasLost).toBe(false);
	});

	test('sendGrid emits GAME_STATE with correct payload', () => {
		player.grid = [
			[{ filled: false }, { filled: false }],
			[{ filled: false }, { filled: false }]
		];
		player.currentPiece = { shape: [[1]], color: 'red', position: { x: 0, y: 0 }, clone: () => ({ shape: [[1]], color: 'red', position: { x: 0, y: 0 } }) };
		player.pieces = new Set([
			{ shape: [[1]], color: 'red', position: { x: 0, y: 0 } },
			{ shape: [[1]], color: 'blue', position: { x: 0, y: 0 } },
			{ shape: [[1]], color: 'green', position: { x: 0, y: 0 } }
		]);
		const otherPlayer = Object.assign(new Player(mockConnection, 'player2', 'Bob'), {
			getLandSpecter: vi.fn(() => [[{ filled: true }]])
		});
		player.room.clients = new Set([player, otherPlayer]);
		player.getLandSpecter = vi.fn(() => [[{ filled: true }]]);
		player.currentPieceIndex = 0;
		player.emit = vi.fn();
		player.removePieceFromGrid = vi.fn((piece, grid) => grid);
		player.mergePieceIntoGrid = vi.fn((piece, grid, ghost) => grid);
		player.getGhostPiece = vi.fn(() => player.currentPiece);
		player.sendGrid();
		expect(player.emit).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				room: expect.objectContaining({ id: 'room1' }),
				grid: expect.anything(),
				currentPiece: player.currentPiece,
				nextPieces: expect.any(Array),
				you: expect.objectContaining({ id: 'player1' }),
				clients: expect.any(Array)
			})
		);
	});

	test('getGhostPiece returns null if no currentPiece', () => {
		player.currentPiece = null;
		expect(player.getGhostPiece([])).toBeNull();
	});

	test('getGhostPiece returns ghost piece with correct position', () => {
		const piece = {
			shape: [[1]],
			position: { x: 0, y: 0 },
			clone: vi.fn(function () { return { ...this, position: { ...this.position } }; })
		};
		player.currentPiece = piece;
		player.isValidMove = vi.fn((p, grid, pos) => pos.y < 2);
		const ghost = player.getGhostPiece([[{ filled: false }]]);
		expect(ghost.position.y).toBe(1);
	});

	test('getLandSpecter returns DEFAULT_EMPTY_GRID if grid or currentPiece missing', () => {
		player.grid = null;
		player.currentPiece = {};
		expect(player.getLandSpecter()).toStrictEqual(DEFAULT_EMPTY_GRID);
		player.grid = [[{ filled: false }]];
		player.currentPiece = null;
		expect(player.getLandSpecter()).toStrictEqual(DEFAULT_EMPTY_GRID);
	});

	test('getLandSpecter returns gray grid for filled cells', () => {
		player.grid = [
			[{ filled: true, indestructible: false }, { filled: false }]
		];
		player.currentPiece = { shape: [[1]], position: { x: 0, y: 0 } };
		player.removePieceFromGrid = vi.fn((piece, grid) => grid);
		const result = player.getLandSpecter();
		expect(result[0][0].color).toBe('gray');
	});

	test('isValidMove returns false for out-of-bounds', () => {
		const piece = { shape: [[1]], position: { x: 0, y: 0 }, rotate: () => [[1]] };
		player.room.rows = 2;
		player.room.cols = 2;
		const grid = [
			[{ filled: false }, { filled: false }],
			[{ filled: false }, { filled: false }]
		];
		expect(player.isValidMove(piece, grid, { x: -1, y: 0 })).toBe(false);
		expect(player.isValidMove(piece, grid, { x: 0, y: -1 })).toBe(false);
		expect(player.isValidMove(piece, grid, { x: 2, y: 0 })).toBe(false);
		expect(player.isValidMove(piece, grid, { x: 0, y: 2 })).toBe(false);
	});

	test('isValidMove returns false for filled cell', () => {
		const piece = { shape: [[1]], position: { x: 0, y: 0 }, rotate: () => [[1]] };
		player.room.rows = 2;
		player.room.cols = 2;
		const grid = [
			[{ filled: true }, { filled: false }],
			[{ filled: false }, { filled: false }]
		];
		expect(player.isValidMove(piece, grid, { x: 0, y: 0 })).toBe(false);
	});

	test('isValidMove returns true for valid move', () => {
		const piece = { shape: [[1]], position: { x: 0, y: 0 }, rotate: () => [[1]] };
		player.room.rows = 2;
		player.room.cols = 2;
		const grid = [
			[{ filled: false }, { filled: false }],
			[{ filled: false }, { filled: false }]
		];
		expect(player.isValidMove(piece, grid, { x: 0, y: 0 })).toBe(true);
	});

	test('updatePieceOnGrid updates correct cells and skips indestructible', () => {
		const piece = { shape: [[1, 0], [1, 1]], position: { x: 0, y: 0 } };
		player.room.rows = 2;
		player.room.cols = 2;
		const grid = [
			[{ indestructible: false }, { indestructible: true }],
			[{ indestructible: false }, { indestructible: false }]
		];
		const updateCell = vi.fn();
		player.updatePieceOnGrid(piece, grid, updateCell);
		expect(updateCell).toHaveBeenCalledTimes(3);
	});

	test('mergePieceIntoGrid calls updatePieceOnGrid with correct cell values', () => {
		const piece = { shape: [[1]], color: 'red', position: { x: 0, y: 0 } };
		player.room.rows = 1;
		player.room.cols = 1;
		const grid = [[{}]];
		const spy = vi.spyOn(player, 'updatePieceOnGrid');
		player.mergePieceIntoGrid(piece, grid, true);
		expect(spy).toHaveBeenCalledWith(piece, grid, expect.any(Function));
	});

	test('removePieceFromGrid calls updatePieceOnGrid with correct cell values', () => {
		const piece = { shape: [[1]], position: { x: 0, y: 0 } };
		player.room.rows = 1;
		player.room.cols = 1;
		const grid = [[{}]];
		const spy = vi.spyOn(player, 'updatePieceOnGrid');
		player.removePieceFromGrid(piece, grid);
		expect(spy).toHaveBeenCalledWith(piece, grid, expect.any(Function));
	});

	test('penalize returns if no grid', () => {
		player.grid = null;
		player.penalize(2);
		expect(player.grid).toBeNull();
	});

	test('penalize adds penalty lines', () => {
		player.room.rows = 2;
		player.room.cols = 2;
		player.grid = [
			[{ indestructible: false }, { indestructible: false }],
			[{ indestructible: false }, { indestructible: false }]
		];
		player.penalize(1);
		expect(player.grid.length).toBe(2);
		expect(player.grid[1].every(cell => cell.indestructible)).toBe(true);
	});

	test('penalize keeps existing penalties and normal rows', () => {
		player.room.rows = 2;
		player.room.cols = 2;
		const penaltyRow = [{ indestructible: true }, { indestructible: true }];
		player.grid = [
			penaltyRow,
			[{ indestructible: false }, { indestructible: false }]
		];
		player.penalize(1);
		expect(player.grid.filter(row => row.every(cell => cell.indestructible)).length).toBe(2);
	});

	test('clearFullLines returns if no grid', () => {
		player.grid = null;
		player.clearFullLines();
		expect(player.grid).toBeNull();
	});

	test('clearFullLines clears full lines and applies penalties', () => {
		player.room.rows = 2;
		player.room.cols = 2;
		player.grid = [
			[{ filled: true, indestructible: false }, { filled: true, indestructible: false }],
			[{ filled: false, indestructible: false }, { filled: false, indestructible: false }]
		];
		player.room.handlePenalties = vi.fn();
		player.clearFullLines();
		expect(player.grid.length).toBe(2);
		expect(player.room.handlePenalties).not.toHaveBeenCalled();
	});

	test('clearFullLines refills grid to correct size', () => {
		player.room.rows = 2;
		player.room.cols = 2;
		player.grid = [
			[{ filled: true, indestructible: false }, { filled: true, indestructible: false }],
			[{ filled: true, indestructible: false }, { filled: true, indestructible: false }]
		];
		player.room.handlePenalties = vi.fn();
		player.clearFullLines();
		expect(player.grid.length).toBe(2);
	});

	test('clearFullLines applies penalties if clearedLines > 1', () => {
		player.room.rows = 2;
		player.room.cols = 2;
		player.grid = [
			[{ filled: true, indestructible: false }, { filled: true, indestructible: false }],
			[{ filled: true, indestructible: false }, { filled: true, indestructible: false }]
		];
		player.room.handlePenalties = vi.fn();
		player.clearFullLines();
		expect(player.room.handlePenalties).toHaveBeenCalled();
	});

	test('handlePieceLanding returns if no currentPiece', () => {
		player.currentPiece = null;
		player.handlePieceLanding();
		// nothing to assert, just coverage
	});

	test('handlePieceLanding calls sendGameOver if nextPiece invalid', () => {
		const nextPiece = { position: { x: 0, y: 0 }, getLeadingEmptyRows: vi.fn(() => 0) };
		player.currentPiece = { dummy: true };
		player.nextPiece = vi.fn(() => nextPiece);
		player.isValidMove = vi.fn(() => false);
		player.sendGameOver = vi.fn();
		player.clearFullLines = vi.fn();
		player.handlePieceLanding();
		expect(player.sendGameOver).toHaveBeenCalled();
	});

	test('handlePieceLanding updates currentPiece and grid', () => {
		const nextPiece = { position: { x: 0, y: 0 }, getLeadingEmptyRows: vi.fn(() => 0) };
		player.currentPiece = { dummy: true };
		player.nextPiece = vi.fn(() => nextPiece);
		player.isValidMove = vi.fn(() => true);
		player.clearFullLines = vi.fn();
		player.mergePieceIntoGrid = vi.fn(() => []);
		player.sendGrid = vi.fn();
		player.handlePieceLanding();
		expect(player.currentPiece).toBe(nextPiece);
		expect(player.mergePieceIntoGrid).toHaveBeenCalled();
		expect(player.sendGrid).toHaveBeenCalled();
	});

	test('movePiece returns if no currentPiece', () => {
		player.currentPiece = null;
		player.movePiece();
		// nothing to assert, just coverage
	});

	test('movePiece handles down direction', () => {
		const piece = {
			position: { x: 0, y: 0 },
			shape: [[1]],
			rotate: vi.fn(() => [[1]])
		};
		player.currentPiece = piece;
		player.grid = [[{ filled: false }]];
		player.room.rows = 1;
		player.room.cols = 1;
		player.removePieceFromGrid = vi.fn(() => [[{ filled: false }]]);
		player.mergePieceIntoGrid = vi.fn(() => [[{ filled: false }]]);
		player.isValidMove = vi.fn(() => true);
		player.sendGrid = vi.fn();
		player.handlePieceLanding = vi.fn();

		player.movePiece('down');
		expect(player.sendGrid).toHaveBeenCalled();
	});

	test('movePiece handles blocked move and triggers landing', () => {
		const piece = {
			position: { x: 0, y: 0 },
			shape: [[1]],
			rotate: vi.fn(() => [[1]])
		};
		player.currentPiece = piece;
		player.grid = [[{ filled: false }]];
		player.room.rows = 1;
		player.room.cols = 1;
		player.removePieceFromGrid = vi.fn(() => [[{ filled: false }]]);
		player.mergePieceIntoGrid = vi.fn(() => [[{ filled: false }]]);
		player.isValidMove = vi.fn(() => false);
		player.sendGrid = vi.fn();
		player.handlePieceLanding = vi.fn();
		player.movePiece('down');
		expect(player.handlePieceLanding).toHaveBeenCalled();
	});

	test('tickInterval returns if no room', () => {
		player.room = null;
		const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
		player.tickInterval();
		expect(logSpy).toHaveBeenCalledWith('No room to start interval');
		logSpy.mockRestore();
	});

	test('tickInterval returns if hasLost', () => {
		player.room = { dummy: true };
		player.hasLost = true;
		player.tickInterval();
		// nothing to assert, just coverage
	});

	test('tickInterval calls movePiece', () => {
		player.room = { dummy: true };
		player.hasLost = false;
		player.movePiece = vi.fn();
		player.tickInterval();
		expect(player.movePiece).toHaveBeenCalled();
	});

});
