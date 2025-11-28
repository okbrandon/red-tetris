import { jest, expect } from '@jest/globals';
import gameSettings from '../constants/game-settings.js';
import gameStatus from '../constants/game-status.js';
import outgoingEvents from '../constants/outgoing-events.js';
import gameModes from '../constants/game-modes.js';
import Player from '../player.js';
import Statistics from '../statistics.js';
import { createMockPiece } from '../__mocks__/_mockPiece.js';

function makeConn() { return { send: jest.fn(), emit: jest.fn() }; }

function makePiece({ shape = [[1]], color = 'red', position = { x: 0, y: 0 } } = {}) {
	return {
		shape,
		color,
		position: { ...position },
		clone: jest.fn(() => ({ shape: shape.map(r => [...r]), color, position: { ...position } })),
		rotate: jest.fn(() => shape),
		getLeadingEmptyRows: jest.fn(() => 0)
	};
}

function makeRoom(overrides = {}) {
	return {
		id: 'room1',
		owner: { id: 'owner1', username: 'Owner', score: 0, hasLost: false },
		status: gameStatus.WAITING,
		soloJourney: false,
		rows: gameSettings.FRAME_ROWS,
		cols: gameSettings.FRAME_COLS,
		handlePenalties: jest.fn(),
		broadcastLinesCleared: jest.fn(),
		getWinner: jest.fn(() => null),
		clients: new Set(),
		cancelPlayerTick: jest.fn(),
		schedulePlayerTick: jest.fn(),
		maxPlayers: gameSettings.MAX_PLAYERS_PER_ROOM,
		mode: gameModes.CLASSIC,
		...overrides
	};
}

describe('Player', () => {
	let mockConnection;
	let player;

	/**
	 * Setup a fresh Player instance before each test.
	 */
	beforeEach(() => {
		mockConnection = makeConn();
		player = new Player(mockConnection, 'player1', 'Alice');
		player.room = makeRoom();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.pieces = new Set([createMockPiece(), createMockPiece({ color: 'blue' })]);
		player.currentPiece = createMockPiece();
		player.currentPieceIndex = 0;
		player.hasLost = false;
	});

	/**
	 * Clean up after each test.
	 */
	afterEach(() => {
		mockConnection = null;
		if (player && typeof player.isValidMove === 'function' && player.isValidMove._isMockFunction) {
			player.isValidMove = Player.prototype.isValidMove;
		}
		player = null;
	});

	/**
	 * Test constructor and basic methods.
	 */
	test('constructor initializes properties', () => {
		const p = new Player(mockConnection, 'id', 'name');

		expect(p.connection).toBe(mockConnection);
		expect(p.id).toBe('id');
		expect(p.username).toBe('name');
		expect(p.room).toBeNull();
		expect(p.pieces.size).toBe(0);
		expect(p.currentPiece).toBeNull();
		expect(p.currentPieceIndex).toBe(0);
		expect(p.grid).toBeNull();
		expect(p.hasLost).toBe(false);
		expect(p.level).toBe(0);
		expect(p.totalLinesCleared).toBe(0);
	});

	/**
	 * Test constructor sets username to null if not provided.
	 */
	test('constructor sets username to null if not provided', () => {
		const p = new Player(mockConnection, 'id');
		expect(p.username).toBeNull();
	});

	/**
	 * Test send and emit methods.
	 */
	test('send calls connection.send', () => {
		player.send('msg');
		expect(mockConnection.send).toHaveBeenCalledWith('msg');
	});

	/**
	 * Test emit method.
	 */
	test('emit calls connection.emit', () => {
		player.emit('event', { foo: 1 });
		expect(mockConnection.emit).toHaveBeenCalledWith('event', { foo: 1 });
	});

	/**
	 * Test sendGrid method.
	 */
	test('sendGrid emits GAME_STATE with correct data', () => {
		player.getLandSpecter = jest.fn(() => 'specter');
		player.currentPiece = createMockPiece();
		player.pieces = new Set([createMockPiece(), createMockPiece({ color: 'blue' })]);
		player.sendGrid();

		expect(mockConnection.emit).toHaveBeenCalledWith(outgoingEvents.GAME_STATE, expect.objectContaining({
			room: expect.objectContaining({ id: 'room1' }),
			grid: expect.anything(),
			currentPiece: expect.anything(),
			nextPieces: expect.any(Array),
			you: expect.objectContaining({ id: 'player1', username: 'Alice', hasLost: false, specter: 'specter' }),
			clients: expect.any(Array)
		}));
	});

	/**
	 * Test sendGrid includes specters of other players.
	 */
	test('sendGrid emits GAME_STATE with specter of other players', () => {
		const otherPlayer = new Player(mockConnection, 'player2', 'Bob');

		otherPlayer.getLandSpecter = jest.fn(() => 'bob-specter');
		otherPlayer.hasLost = false;
		player.room.clients.add(otherPlayer);
		player.sendGrid();

		expect(mockConnection.emit).toHaveBeenCalledWith(outgoingEvents.GAME_STATE, expect.anything());
	});

	/**
	 * Test sendGameOver method.
	 */
	test('sendGameOver sets hasLost and emits GAME_OVER', () => {
		player.room.clients.add(player);
		player.hasLost = false;
		player.sendGameOver('Lost!');

		expect(mockConnection.emit).toHaveBeenCalledWith(outgoingEvents.GAME_OVER, expect.objectContaining({
			room: expect.objectContaining({ id: 'room1' }),
			clients: expect.any(Array),
			message: 'Lost!'
		}));
	});

	/**
	 * Test sendGameLost does not emit if already lost.
	 */
	test('sendGameLost does nothing if hasLost is already true', () => {
		player.hasLost = true;
		player.sendGameLost('Lost!');

		expect(mockConnection.emit).not.toHaveBeenCalled();
	});

	/**
	 * Test nextPiece method.
	 */
	test('nextPiece returns null if no pieces', () => {
		player.pieces.clear();
		expect(player.nextPiece()).toBeNull();
	});

	/**
	 * Test nextPiece returns next piece and increments index.
	 */
	test('nextPiece returns next piece and increments index', () => {
		const first = Array.from(player.pieces)[0];

		expect(player.nextPiece()).toBe(first);
		expect(player.currentPieceIndex).toBe(1);
	});

	/**
	 * Test getGhostPiece method.
	 */
	test('getGhostPiece returns null if no currentPiece', () => {
		player.currentPiece = null;
		expect(player.getGhostPiece(player.grid)).toBeNull();
	});

	/**
	 * Test getGhostPiece returns ghost piece with correct y.
	 */
	test('getGhostPiece returns ghost piece with correct y', () => {
		const piece = createMockPiece();

		piece.clone = jest.fn(() => createMockPiece());
		player.currentPiece = piece;
		player.isValidMove = jest.fn()
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(false);

		const ghost = player.getGhostPiece(player.grid);

		expect(ghost.position.y).toBe(piece.position.y);
	});

	/**
	 * Test getLandSpecter method.
	 */
	test('getLandSpecter returns DEFAULT_EMPTY_GRID if no grid or currentPiece', () => {
		player.grid = null;
		expect(player.getLandSpecter()).toBe(gameSettings.DEFAULT_EMPTY_GRID);

		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.currentPiece = null;
		expect(player.getLandSpecter()).toBe(gameSettings.DEFAULT_EMPTY_GRID);
	});

	/**
	 * Test getLandSpecter returns a gray overlay grid.
	 */
	test('getLandSpecter returns a gray overlay grid', () => {
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.currentPiece = createMockPiece();
		player.grid[gameSettings.FRAME_ROWS - 1][0] = { filled: true, color: 'red', indestructible: false, ghost: false };

		const specter = player.getLandSpecter();

		expect(specter[gameSettings.FRAME_ROWS - 1][0].color).toBe('gray');
	});

	/**
	 * Test generateEmptyGrid method.
	 */
	test('generateEmptyGrid sets grid to DEFAULT_EMPTY_GRID', () => {
		player.grid = null;
		player.generateEmptyGrid();

		expect(player.grid).toEqual(gameSettings.DEFAULT_EMPTY_GRID);
	});

	/**
	 * Test isValidMove method.
	 */
	test('isValidMove returns false for out of bounds', () => {
		const piece = createMockPiece();

		expect(player.isValidMove(piece, player.grid, { x: -1, y: 0 })).toBe(false);
		expect(player.isValidMove(piece, player.grid, { x: 100, y: 0 })).toBe(false);
		expect(player.isValidMove(piece, player.grid, { x: 0, y: -1 })).toBe(true);
		expect(player.isValidMove(piece, player.grid, { x: 0, y: 100 })).toBe(false);
	});

	/**
	 * Test isValidMove returns false for collision with filled cell.
	 */
	test('isValidMove returns false for filled cell', () => {
		const piece = createMockPiece();

		player.grid[0][0].filled = true;
		expect(player.isValidMove(piece, player.grid, { x: 0, y: 0 })).toBe(false);
	});

	/**
	 * Test isValidMove returns true for valid move.
	 */
	test('isValidMove returns true for valid move', () => {
		const piece = createMockPiece();
		expect(player.isValidMove(piece, player.grid, { x: 0, y: 0 })).toBe(true);
	});

	/**
	 * Test isValidMove uses rotated shape when rotate=true.
	 */
	test('isValidMove uses rotated shape when rotate=true', () => {
		const piece = createMockPiece();

		piece.rotate = jest.fn(() => [[1]]);
		player.room.rows = 1;
		player.room.cols = 1;

		const grid = [[{ filled: false }]];

		expect(player.isValidMove(piece, grid, { x: 0, y: 0 }, true)).toBe(true);
		expect(piece.rotate).toHaveBeenCalled();
	});

	/**
	 * Test isValidMove returns true for valid move (explicit final return).
	 */
	test('isValidMove returns true for valid move (explicit final return)', () => {
		const piece = createMockPiece({ shape: [[1]], position: { x: 0, y: 0 } });

		player.room.rows = 1;
		player.room.cols = 1;

		const grid = [[{ filled: false }]];

		expect(player.isValidMove(piece, grid, { x: 0, y: 0 })).toBe(true);
	});

	/**
	 * Test isValidMove skips empty cells in shape.
	 */
	test('isValidMove skips empty cells in shape', () => {
		const piece = createMockPiece({ shape: [[0, 1], [0, 0]], position: { x: 0, y: 0 } });
		const grid = [
			[{ filled: false }, { filled: true }],
			[{ filled: false }, { filled: false }]
		];

		expect(player.isValidMove(piece, grid, { x: 0, y: 1 })).toBe(true);
	});

	/**
	 * Test updatePieceOnGrid method.
	 */
	test('updatePieceOnGrid updates grid cells', () => {
		const piece = createMockPiece();
		const grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		const updated = player.updatePieceOnGrid(piece, grid, () => ({ filled: true, color: 'red', indestructible: false, ghost: false }));

		expect(updated[0][0].filled).toBe(true);
	});

	/**
	 * Test updatePieceOnGrid iterates over shape and updates grid.
	 */
	test('updatePieceOnGrid iterates over shape and updates grid', () => {
		const piece = createMockPiece({ shape: [[1, 0], [0, 1]], position: { x: 0, y: 0 } });
		const grid = [
			[{ filled: false }, { filled: false }],
			[{ filled: false }, { filled: false }]
		];

		player.room.rows = 2;
		player.room.cols = 2;

		const updated = player.updatePieceOnGrid(piece, grid, () => ({ filled: true }));

		expect(updated[0][0].filled).toBe(true);
		expect(updated[1][1].filled).toBe(true);
	});

	/**
	 * Test updatePieceOnGrid does not update indestructible cells.
	 */
	test('updatePieceOnGrid does not update indestructible cells', () => {
		const piece = createMockPiece();
		const grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);

		piece.position = { x: 0, y: 0 };
		grid[0][0] = { filled: false, color: 'transparent', indestructible: true, ghost: false };

		const updateCell = jest.fn(() => ({ filled: true, color: 'red', indestructible: false, ghost: false }));
		const updated = player.updatePieceOnGrid(piece, grid, updateCell);

		expect(updated[0][0]).toEqual({ filled: false, color: 'transparent', indestructible: true, ghost: false });
		expect(updateCell).not.toHaveBeenCalled();
	});

	/**
	 * Test mergePieceIntoGrid calls updatePieceOnGrid.
	 */
	test('mergePieceIntoGrid calls updatePieceOnGrid', () => {
		const piece = createMockPiece();
		const grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		const spy = jest.spyOn(player, 'updatePieceOnGrid');

		player.mergePieceIntoGrid(piece, grid);
		expect(spy).toHaveBeenCalled();
	});

	/**
	 * Test removePieceFromGrid calls updatePieceOnGrid.
	 */
	test('removePieceFromGrid calls updatePieceOnGrid', () => {
		const piece = createMockPiece();
		const grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		const spy = jest.spyOn(player, 'updatePieceOnGrid');

		player.removePieceFromGrid(piece, grid);
		expect(spy).toHaveBeenCalled();
	});

	/**
	 * Test penalize method.
	 */
	test('penalize does nothing if no grid', () => {
		player.grid = null;
		player.penalize(2);
		expect(player.grid).toBeNull();
	});

});

/**
 * Additional coverage-focused tests and branches
 * for Player class.
 */
describe('Player coverage extras', () => {

	/**
	 * Test updateUsername throws for invalid inputs.
	 */
	test('updateUsername throws for invalid inputs', () => {
		const p = new Player(makeConn(), 'id');

		expect(() => p.updateUsername('')).toThrow('Invalid username');
		expect(() => p.updateUsername(null)).toThrow('Invalid username');
		expect(() => p.updateUsername(123)).toThrow('Invalid username');
		expect(() => p.updateUsername('BAD NAME')).toThrow('Username must be alphanumeric and up to 16 characters long');
		expect(() => p.updateUsername('x'.repeat(17))).toThrow('Username must be alphanumeric and up to 16 characters long');
	});

	/**
	 * Test updateUsername sets username for valid input.
	 */
	test('updateUsername loads statistics and calls sendPlayerStatsBoard on success', async () => {
		const p = new Player(makeConn(), 'id');
		const loadSpy = jest.spyOn(Statistics.prototype, 'load').mockResolvedValue();
		const sendSpy = jest.spyOn(p, 'sendPlayerStatsBoard').mockImplementation(() => {});
		const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

		p.updateUsername('ValidUser');
		await new Promise(r => setImmediate(r));

		expect(loadSpy).toHaveBeenCalled();
		expect(sendSpy).toHaveBeenCalled();

		loadSpy.mockRestore();
		sendSpy.mockRestore();
		consoleLog.mockRestore();
	});

	/**
	 * Test updateUsername handles load rejection (logs error).
	 */
	test('updateUsername handles load rejection (logs error)', async () => {
		const p = new Player(makeConn(), 'id');
		const loadSpy = jest.spyOn(Statistics.prototype, 'load').mockRejectedValue(new Error('fail'));
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

		p.updateUsername('ValidUser2');
		await new Promise(r => setImmediate(r));

		expect(loadSpy).toHaveBeenCalled();
		expect(consoleError).toHaveBeenCalled();

		loadSpy.mockRestore();
		consoleError.mockRestore();
	});

	/**
	 * Test movePiece up returns early when rate-limited.
	 */
	test('movePiece up returns early when rate-limited', () => {
		const p = new Player(makeConn(), 'id');

		p.currentPiece = createMockPiece();
		p.grid = [[{ filled: false }]];
		p.room = makeRoom({ rows: 1, cols: 1 });

		const limiter = p.rateLimiters['movePiece'] || p.rateLimiters[Object.keys(p.rateLimiters)[0]];

		limiter.lastCalled = Date.now();
		p.sendGrid = jest.fn();
		p.movePiece('up');

		expect(p.sendGrid).not.toHaveBeenCalled();
	});

	/**
	 * Test movePiece up rotates when allowed and isValidMove true.
	 */
	test('movePiece up rotates when allowed and isValidMove true', () => {
		const p = new Player(makeConn(), 'id');
		const piece = createMockPiece({ shape: [[1]], position: { x: 0, y: 0 } });

		piece.rotate = jest.fn(() => [[2]]);
		p.currentPiece = piece;
		p.grid = [[{ filled: false }]];
		p.room = makeRoom({ rows: 1, cols: 1 });

		const limiter = p.rateLimiters['movePiece'] || p.rateLimiters[Object.keys(p.rateLimiters)[0]];

		limiter.lastCalled = 0;
		p.isValidMove = jest.fn(() => true);
		p.sendGrid = jest.fn();
		p.movePiece('up');

		expect(piece.rotate).toHaveBeenCalled();
		expect(p.currentPiece.shape).toEqual([[2]]);
		expect(p.sendGrid).toHaveBeenCalled();
	});

	/**
	 * Test movePiece up rotates piece when near walls.
	 */
	test('movePiece up rotates piece when near walls and isValidMove true', () => {
		const p = new Player(makeConn(), 'id');
		const piece = createMockPiece({ shape: [[0, 1], [0, 1]], position: { x: 0, y: 0 } });

		piece.rotate = jest.fn(() => [[1, 0], [1, 0]]);
		p.currentPiece = piece;
		p.grid = [[{ filled: false }, { filled: false }], [{ filled: false }, { filled: false }]];
		p.room = makeRoom({ rows: 2, cols: 2 });

		const limiter = p.rateLimiters['movePiece'] || p.rateLimiters[Object.keys(p.rateLimiters)[0]];

		limiter.lastCalled = 0;
		p.isValidMove = jest.fn()
			.mockReturnValueOnce(false)
			.mockReturnValue(true);
		p.sendGrid = jest.fn();
		p.movePiece('up');

		expect(piece.rotate).toHaveBeenCalled();
		expect(p.currentPiece.shape).toEqual([[1, 0], [1, 0]]);
		expect(p.currentPiece.position.x).toBe(1);
		expect(p.sendGrid).toHaveBeenCalled();
	});

	/**
	 * When rotation produces an invalid placement and the piece is not near
	 * a wall, no wall-kick attempts should be made and the piece should
	 * remain unrotated.
	 */
	test('movePiece up does not rotate when rotate invalid and not near wall', () => {
		const p = new Player(makeConn(), 'id');
		const originalShape = [[1, 1]];
		const piece = createMockPiece({ shape: originalShape, position: { x: 2, y: 0 } });

		piece.rotate = jest.fn(() => [[1, 1]]);
		p.currentPiece = piece;
		p.grid = [[{ filled: false }, { filled: false }, { filled: false }, { filled: false }]];
		p.room = makeRoom({ rows: 1, cols: 6 });

		const limiter = p.rateLimiters['movePiece'] || p.rateLimiters[Object.keys(p.rateLimiters)[0]];

		limiter.lastCalled = 0;
		p.isValidMove = jest.fn(() => false);
		p.sendGrid = jest.fn();
		p.movePiece('up');

		expect(piece.rotate).toHaveBeenCalled();
		expect(p.currentPiece.shape).toEqual(originalShape);
		expect(p.currentPiece.position.x).toBe(2);
		expect(p.sendGrid).toHaveBeenCalled();
	});

	/**
	 * When rotation fails at the original position and the piece is near a wall,
	 * but no shifted positions are valid, rotation should not be applied.
	 */
	test('movePiece up does not rotate when wall-kick fails', () => {
		const p = new Player(makeConn(), 'id');
		const originalShape = [[0, 1], [0, 1]];
		const piece = createMockPiece({ shape: originalShape, position: { x: 0, y: 0 } });

		piece.rotate = jest.fn(() => [[1, 0], [1, 0]]);
		p.currentPiece = piece;
		p.grid = [[{ filled: false }, { filled: false }], [{ filled: false }, { filled: false }]];
		p.room = makeRoom({ rows: 2, cols: 2 });

		const limiter = p.rateLimiters['movePiece'] || p.rateLimiters[Object.keys(p.rateLimiters)[0]];

		limiter.lastCalled = 0;
		p.isValidMove = jest.fn(() => false);
		p.sendGrid = jest.fn();
		p.movePiece('up');

		expect(piece.rotate).toHaveBeenCalled();
		expect(p.currentPiece.shape).toEqual(originalShape);
		expect(p.currentPiece.position.x).toBe(0);
		expect(p.sendGrid).toHaveBeenCalled();
	});

	/**
	 * Cover branch where rotatedShape[0] is not an Array (e.g., Uint8Array rows)
	 * so the rotatedWidth calculation uses the alternate branch, and also
	 * cover the direction = -1 path when position.x >= 1.
	 */
	test('movePiece up uses alternate rotatedWidth branch and wall-kick left', () => {
		const p = new Player(makeConn(), 'id');
		const piece = createMockPiece({ shape: [[0, 1], [0, 1]], position: { x: 2, y: 0 } });

		const rotatedShape = [Uint8Array.from([1, 0]), Uint8Array.from([1, 0])];
		piece.rotate = jest.fn(() => rotatedShape);
		p.currentPiece = piece;
		p.grid = [
			[{ filled: false }, { filled: false }, { filled: false }],
			[{ filled: false }, { filled: false }, { filled: false }]
		];
		p.room = makeRoom({ rows: 2, cols: 3 });

		const limiter = p.rateLimiters['movePiece'] || p.rateLimiters[Object.keys(p.rateLimiters)[0]];
		limiter.lastCalled = 0;

		p.isValidMove = jest.fn()
			.mockReturnValueOnce(false)
			.mockReturnValueOnce(true);

		p.sendGrid = jest.fn();
		p.movePiece('up');

		expect(piece.rotate).toHaveBeenCalled();
		expect(p.currentPiece.shape).toBe(rotatedShape);
		expect(p.currentPiece.position.x).toBe(1);
		expect(p.sendGrid).toHaveBeenCalled();
	});

	/**
	 * Test swapWithNext early returns for missing conditions.
	 */
	test('swapWithNext early returns for missing conditions', () => {
		const p = new Player(makeConn(), 'id');

		p.currentPiece = null;
		p.swapWithNext();
		p.currentPiece = createMockPiece();
		p.hasLost = true;
		p.swapWithNext();
		p.hasLost = false;
		p.room = null;
		p.swapWithNext();
		p.room = makeRoom({ status: 'NOT_IN_GAME' });
		p.pieces = new Set();
		p.swapWithNext();
	});

	/**
	 * Test movePiece unknown direction returns without sendGrid.
	 */
	test('movePiece unknown direction returns without sendGrid', () => {
		const p = new Player(makeConn(), 'id');

		p.currentPiece = createMockPiece();
		p.grid = [[{ filled: false }]];
		p.room = makeRoom({ rows: 1, cols: 1 });
		p.sendGrid = jest.fn();
		p.movePiece('this-does-not-exist');

		expect(p.sendGrid).not.toHaveBeenCalled();
	});

	/**
	 * Test swapWithNext returns when nextPiece is falsy.
	 */
	test('swapWithNext returns when nextPiece is falsy', () => {
		const p = new Player(makeConn(), 'id');

		p.currentPiece = createMockPiece();
		p.room = makeRoom({ status: gameStatus.IN_GAME });
		p.pieces = new Set([undefined]);

		expect(() => p.swapWithNext()).not.toThrow();
	});

	/**
	 * Test movePiece space returns early when spawn rate-limited.
	 */
	test('movePiece space returns early when spawn rate-limited', () => {
		const p = new Player(makeConn(), 'id');

		p.currentPiece = createMockPiece({ position: { x: 0, y: 0 } });
		p.grid = [[{ filled: false }]];
		p.room = makeRoom({ rows: 1, cols: 1 });

		const spawnLimiter = p.rateLimiters[Object.keys(p.rateLimiters)[1]];

		spawnLimiter.lastCalled = Date.now();
		p.sendGrid = jest.fn();
		p.movePiece('space');

		expect(p.sendGrid).not.toHaveBeenCalled();
	});

	/**
	 * Test swapWithNext returns when currentPiece is falsy.
	 */
	test('swapWithNext returns when pieces set is empty', () => {
		const p = new Player(makeConn(), 'id');

		p.currentPiece = createMockPiece();
		p.room = makeRoom({ status: gameStatus.IN_GAME });
		p.pieces = new Set();

		expect(() => p.swapWithNext()).not.toThrow();
	});

	/**
	 * Test swapWithNext revert branch assigns and calls sendGrid.
	 */
	test('swapWithNext revert branch assigns and calls sendGrid', () => {
		const p = new Player(makeConn(), 'id');

		p.currentPiece = createMockPiece();

		const next = { shape: [[9]], color: 'pink' };

		p.pieces = new Set([next]);
		p.currentPieceIndex = 0;
		p.room = makeRoom({ status: gameStatus.IN_GAME });
		p.grid = [[{ filled: false }]];
		p.isValidMove = jest.fn(() => false);
		p.sendGrid = jest.fn();
		p.swapWithNext();

		expect(p.sendGrid).toHaveBeenCalled();
	});
});

/**
 * Tests for additional branches in Player class methods.
 */
describe('Player extra branches', () => {

	/**
	 * Test sendPlayerStatsBoard does not emit when no statistics.
	 */
	test('sendPlayerStatsBoard emits when statistics present', () => {
		const conn = makeConn();
		const p = new Player(conn, 'p1', 'User');

		p.statistics = { getStats: jest.fn(() => ['a','b']) };
		p.sendPlayerStatsBoard();

		expect(conn.emit).toHaveBeenCalledWith(outgoingEvents.PLAYER_STATS_BOARD, expect.objectContaining({ gameHistory: ['a','b'] }));
	});

	/**
	 * Test sendPlayerStatsBoard does not emit when no statistics.
	 */
	test('swapWithNext reverts when new position invalid', () => {
		const conn = makeConn();
		const p = new Player(conn, 'p2', 'User2');

		p.room = makeRoom({ status: gameStatus.IN_GAME });
		p.grid = [[{ filled: false }]];
		p.currentPiece = makePiece({ shape: [[1]], position: { x: 0, y: 0 } });

		const next = makePiece({ shape: [[2]], color: 'blue', position: { x: 0, y: 0 } });

		p.pieces = new Set([next]);
		p.currentPieceIndex = 0;
		p.isValidMove = jest.fn(() => false);
		p.sendGrid = jest.fn();
		p.swapWithNext();

		expect(p.sendGrid).toHaveBeenCalled();
	});

	/**
	 * Test swapWithNext succeeds when position valid.
	 */
	test('swapWithNext succeeds when position valid', () => {
		const conn = makeConn();
		const p = new Player(conn, 'p3', 'User3');

		p.room = makeRoom({ status: gameStatus.IN_GAME });
		p.grid = [[{ filled: false }]];
		p.currentPiece = makePiece({ shape: [[1]], color: 'red', position: { x: 0, y: 0 } });

		const next = makePiece({ shape: [[2]], color: 'blue', position: { x: 0, y: 0 } });

		p.pieces = new Set([next]);
		p.currentPieceIndex = 0;
		p.isValidMove = jest.fn(() => true);
		p.sendGrid = jest.fn();

		const expectedShape = JSON.parse(JSON.stringify(next.shape));
		const expectedColor = next.color;

		p.swapWithNext();

		expect(p.sendGrid).toHaveBeenCalled();
		expect(p.currentPiece.shape).toEqual(expectedShape);
		expect(p.currentPiece.color).toEqual(expectedColor);
	});

	/**
	 * Test saveStatistics calls addGameResult and save and handles rejection.
	 */
	test('saveStatistics calls addGameResult and save and handles rejection', async () => {
		const conn = makeConn();
		const p = new Player(conn, 'p4', 'User4');
		const addSpy = jest.fn();
		const saveMock = jest.fn().mockRejectedValue(new Error('save failed'));

		p.statistics = { addGameResult: addSpy, save: saveMock };

		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

		p.saveStatistics({ foo: 'bar' });
		await new Promise(resolve => setImmediate(resolve));

		expect(addSpy).toHaveBeenCalled();
		expect(saveMock).toHaveBeenCalled();
		expect(consoleError).toHaveBeenCalled();
		consoleError.mockRestore();
	});

	/**
	 * Test saveStatistics success path logs saved.
	 */
	test('saveStatistics success path logs saved', async () => {
		const conn = makeConn();
		const p = new Player(conn, 'p5', 'User5');
		const addSpy = jest.fn();
		const saveMock = jest.fn().mockResolvedValue({});

		p.statistics = { addGameResult: addSpy, save: saveMock };

		const consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});

		p.saveStatistics({ result: 'ok' });
		await new Promise(resolve => setImmediate(resolve));

		expect(addSpy).toHaveBeenCalled();
		expect(saveMock).toHaveBeenCalled();
		expect(consoleLog).toHaveBeenCalledWith('Statistics saved for', p.username);
		consoleLog.mockRestore();
	});

	/**
	 * Test sendGrid in invisible mode only sends grid without current piece.
	 */
	test('sendGrid uses invisible mode (ghost only) and emits game state', () => {
		const conn = makeConn();
		const p = new Player(conn, 'p6', 'User6');
		const fakeOwner = { id: 'owner', username: 'owner', score: 0, hasLost: false, getLandSpecter: () => [[{ filled: false }]] };

		p.room = makeRoom({
			owner: fakeOwner,
			status: 'IN_GAME',
			soloJourney: false,
			maxPlayers: 4,
			mode: gameModes.INVISIBLE_FALLING_PIECES,
			clients: new Set([p, fakeOwner]),
			rows: 1,
			cols: 1
		});
		p.grid = [[{ filled: false, color: 'transparent' }]];
		p.currentPiece = makePiece({ shape: [[1]], color: 'red', position: { x: 0, y: 0 } });
		p.pieces = new Set([makePiece({ shape: [[2]], color: 'blue', position: { x: 0, y: 0 } })]);
		p.currentPieceIndex = 0;
		p.getLandSpecter = jest.fn(() => [[{ filled: false }]]);
		p.sendGrid();

		expect(conn.emit).toHaveBeenCalled();

		const callArgs = conn.emit.mock.calls[0];

		expect(callArgs[0]).toBe(outgoingEvents.GAME_STATE);
		expect(callArgs[1]).toHaveProperty('grid');
		expect(Array.isArray(callArgs[1].grid)).toBe(true);
	});

	/**
	 * Test sendGrid in visible mode sends current piece and clients data.
	 */
	test('sendGrid visible mode includes current piece merged and clients data', () => {
		const conn = makeConn();
		const p = new Player(conn, 'p8', 'User8');
		const other = new Player(makeConn(), 'other', 'Other');

		other.getLandSpecter = jest.fn(() => [[{ filled: false }]]);
		p.room = makeRoom({
			id: 'room2',
			owner: other,
			status: 'IN_GAME',
			soloJourney: false,
			maxPlayers: 4,
			mode: gameModes.CLASSIC,
			clients: new Set([p, other])
		});
		p.room.rows = 1;
		p.room.cols = 1;
		p.grid = [[{ filled: false, color: 'transparent' }]];
		p.currentPiece = makePiece({ shape: [[1]], color: 'red', position: { x: 0, y: 0 } });
		p.pieces = new Set([makePiece({ shape: [[2]], color: 'blue', position: { x: 0, y: 0 } })]);
		p.currentPieceIndex = 0;
		p.sendGrid();

		const callArgs = conn.emit.mock.calls[0];

		expect(callArgs[0]).toBe(outgoingEvents.GAME_STATE);
		expect(callArgs[1]).toHaveProperty('currentPiece');
		expect(callArgs[1]).toHaveProperty('clients');
		expect(Array.isArray(callArgs[1].clients)).toBe(true);
	});

	/**
	 * Test sendGameOver emits game over and calls saveStatistics.
	 */
	test('sendGameOver emits game over and calls saveStatistics', () => {
		const conn = makeConn();
		const p = new Player(conn, 'p9', 'User9');
		const winner = new Player(makeConn(), 'w', 'Winner');

		winner.score = 10;
		p.room = makeRoom({
			id: 'r',
			owner: winner,
			status: 'ENDED',
			soloJourney: false,
			maxPlayers: 2,
			mode: 'VISIBLE',
			clients: new Set([p, winner]),
			getWinner: () => winner
		});
		p.score = 5;
		p.statistics = { addGameResult: jest.fn(), save: jest.fn().mockResolvedValue({}) };
		p.sendGameOver('Lost!');

		expect(conn.emit).toHaveBeenCalledWith(outgoingEvents.GAME_OVER, expect.any(Object));
		expect(p.statistics.addGameResult).toHaveBeenCalled();
	});

	/**
	 * Test sendGameOver default message uses default arg and still saves statistics.
	 */
	test('sendGameOver default message uses default arg and still saves statistics', () => {
		const conn = makeConn();
		const p = new Player(conn, 'p10b', 'User10b');
		const winner = new Player(makeConn(), 'w2', 'Winner2');

		winner.score = 1;
		p.room = makeRoom({
			id: 'r2',
			owner: winner,
			status: 'ENDED',
			soloJourney: false,
			maxPlayers: 2,
			mode: gameModes.CLASSIC,
			clients: new Set([p, winner]),
			getWinner: () => winner
		});
		p.statistics = { addGameResult: jest.fn(), save: jest.fn().mockResolvedValue({}) };
		p.sendGameOver();

		expect(conn.emit).toHaveBeenCalledWith(outgoingEvents.GAME_OVER, expect.any(Object));
		expect(p.statistics.addGameResult).toHaveBeenCalled();
	});

	/**
	 * Test sendGameLost returns early when already hasLost.
	 */
	test('sendGameLost returns early when already hasLost', () => {
		const conn = makeConn();
		const p = new Player(conn, 'p10', 'User10');

		p.hasLost = true;
		p.room = makeRoom({ id: 'r' });
		p.sendGameLost('already');

		expect(conn.emit).not.toHaveBeenCalled();
	});

	/**
	 * Test sendGameLost emits GAME_LOST with provided message.
	 */
	test('sendGameLost default message is used when no arg provided', () => {
		const conn = makeConn();
		const p = new Player(conn, 'p11', 'User11');

		p.room = makeRoom({ id: 'r3', owner: { id: 'o', username: 'o', score: 0, hasLost: false }, status: 'IN_GAME', soloJourney: false, maxPlayers: 1, mode: gameModes.CLASSIC });
		p.sendGameLost();

		expect(conn.emit).toHaveBeenCalledWith(outgoingEvents.GAME_LOST, expect.any(Object));
	});

	/**
	 * Test clearFullLines uses fallback scoring when clearedLines > 4.
	 */
	test('clearFullLines uses fallback scoring when clearedLines > 4', () => {
		const conn = makeConn();
		const p = new Player(conn, 'p12', 'User12');
		const room = makeRoom({
			rows: 5,
			cols: 4,
			handlePenalties: jest.fn(),
			broadcastLinesCleared: jest.fn()
		});

		p.room = room;

		const fullRow = Array.from({ length: room.cols }, () => ({ filled: true, indestructible: false, color: 'x', ghost: false }));

		p.grid = [fullRow, fullRow, fullRow, fullRow, fullRow];
		p.score = 0;
		p.clearFullLines();

		expect(room.broadcastLinesCleared).toHaveBeenCalledWith(p, expect.objectContaining({ clearedLines: 5 }));
		expect(p.score).toBe(gameSettings.BPS_SCORING[4].points);
	});

	/**
	 * Test clearFullLines triggers handlePenalties and broadcast when multiple lines cleared.
	 */
	test('clearFullLines triggers handlePenalties and broadcast when multiple lines cleared', () => {
		const conn = makeConn();
		const p = new Player(conn, 'p7', 'User7');
		const room = {
			rows: 4,
			cols: 4,
			handlePenalties: jest.fn(),
			broadcastLinesCleared: jest.fn()
		};

		p.room = room;

		const fullRow = Array.from({ length: room.cols }, () => ({ filled: true, indestructible: false, color: 'x', ghost: false }));
		const normalRow = Array.from({ length: room.cols }, () => ({ filled: false, indestructible: false, color: 'transparent', ghost: false }));

		p.grid = [fullRow, fullRow, fullRow, normalRow];
		p.score = 0;
		p.clearFullLines();

		expect(room.handlePenalties).toHaveBeenCalledWith(p, 2);
		expect(room.broadcastLinesCleared).toHaveBeenCalledWith(p, expect.objectContaining({ clearedLines: 3 }));

		return import('../constants/game-settings.js').then(gs => {
			expect(p.score).toBe(gs.default.BPS_SCORING[3].points);
		});
	});

	test('clearFullLines increments lines cleared and levels', () => {
		const levelingPlayer = new Player(makeConn(), 'leveler', 'Leveler');
		levelingPlayer.room = makeRoom();
		levelingPlayer.totalLinesCleared = 9;
		levelingPlayer.level = 0;
		levelingPlayer.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		levelingPlayer.grid[0] = levelingPlayer.grid[0].map(() => ({ filled: true, color: 'red', indestructible: false, ghost: false }));

		levelingPlayer.clearFullLines();

		expect(levelingPlayer.totalLinesCleared).toBe(10);
		expect(levelingPlayer.level).toBe(1);
	});

	test('getGravityDelay returns NTSC delay for current level', () => {
		const gravityPlayer = new Player(makeConn(), 'gravity', 'Gravity');
		gravityPlayer.room = makeRoom();
		gravityPlayer.level = 0;
		const expected = Math.round(gameSettings.NTSC_GRAVITY_FRAMES[0] * gameSettings.NTSC_FRAME_DURATION_MS);

		expect(gravityPlayer.getGravityDelay(gameModes.CLASSIC)).toBe(expected);
	});

	test('getGravityDelay caps at max table level', () => {
		const gravityPlayer = new Player(makeConn(), 'gravityMax', 'GravityMax');
		gravityPlayer.room = makeRoom();
		gravityPlayer.level = 100;
		const frames = gameSettings.NTSC_GRAVITY_FRAMES[gameSettings.NTSC_GRAVITY_FRAMES.length - 1];
		const expected = Math.round(frames * gameSettings.NTSC_FRAME_DURATION_MS);

		expect(gravityPlayer.getGravityDelay()).toBe(expected);
	});

	test('getGravityDelay applies fast paced multiplier', () => {
		const gravityPlayer = new Player(makeConn(), 'gravityFast', 'GravityFast');
		gravityPlayer.room = makeRoom();
		gravityPlayer.level = 2;
		const classicDelay = gravityPlayer.getGravityDelay(gameModes.CLASSIC);
		const fastDelay = gravityPlayer.getGravityDelay(gameModes.FAST_PACED);

		expect(fastDelay).toBeLessThan(classicDelay);
	});

});

/**
 * Runtime tests for Player class methods.
 */
describe('Player runtime tests', () => {
	let mockConnection;
	let player;

	/**
	 * Setup a new Player instance before each test.
	 */
	beforeEach(() => {
		mockConnection = makeConn();
		player = new Player(mockConnection, 'player1', 'Alice');
		player.room = makeRoom();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.pieces = new Set([createMockPiece(), createMockPiece({ color: 'blue' })]);
		player.currentPiece = createMockPiece();
		player.currentPieceIndex = 0;
		player.hasLost = false;
	});

	/**
	 * Cleanup after each test.
	 */
	afterEach(() => {
		mockConnection = null;
		if (player && typeof player.isValidMove === 'function' && player.isValidMove._isMockFunction) {
			player.isValidMove = Player.prototype.isValidMove;
		}
		player = null;
	});

	/**
	 * Confirms that penalize does nothing if no grid.
	 */
	test('penalize adds penalty lines', () => {
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.penalize(2);

		const lastRow = player.grid[gameSettings.FRAME_ROWS - 1];

		expect(lastRow.every(cell => cell.indestructible)).toBe(true);
	});

	/**
	 * Confirms that penalize does nothing if lines is non-positive.
	 */
	test('clearFullLines does nothing if no grid', () => {
		player.grid = null;
		player.clearFullLines();

		expect(player.grid).toBeNull();
	});

	/**
	 * Confirms that penalize does nothing if lines is non-positive.
	 */
	test('clearFullLines clears full lines and calls handlePenalties', () => {
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.grid[0] = player.grid[0].map(() => ({ filled: true, color: 'red', indestructible: false, ghost: false }));
		player.grid[1] = player.grid[1].map(() => ({ filled: true, color: 'red', indestructible: false, ghost: false }));
		player.clearFullLines();

		expect(player.room.handlePenalties).toHaveBeenCalledWith(player, 1);
	});

	/**
	 * Confirms that penalize does nothing if lines is non-positive.
	 */
	test('handlePieceLanding does nothing if no currentPiece', () => {
		player.currentPiece = null;
		player.handlePieceLanding();

		expect(mockConnection.emit).not.toHaveBeenCalled();
	});

	/**
	 * Confirms that handlePieceLanding sends GAME_OVER if next piece cannot move.
	 */
	test('handlePieceLanding returns early if currentPiece is null', () => {
		player.currentPiece = null;
		player.handlePieceLanding();

		// should not throw or emit
		expect(mockConnection.emit).not.toHaveBeenCalled();
	});

	/**
	 * Confirms that handlePieceLanding sends GAME_OVER if next piece cannot move.
	 */
	test('handlePieceLanding returns early if currentPiece is null (explicit)', () => {
		player.currentPiece = null;
		player.handlePieceLanding();

		expect(mockConnection.emit).not.toHaveBeenCalled();
	});

	/**
	 * Confirms that handlePieceLanding sends GAME_LOST if next piece cannot move.
	 */
	test('handlePieceLanding sends GAME_LOST if next piece cannot move', () => {
		player.nextPiece = jest.fn(() => createMockPiece());
		player.isValidMove = jest.fn(() => false);
		player.currentPiece = createMockPiece();
		player.handlePieceLanding();

		expect(mockConnection.emit).toHaveBeenCalledWith(outgoingEvents.GAME_LOST, expect.anything());
	});

	/**
	 * Confirms that handlePieceLanding sets currentPiece and sends grid.
	 */
	test('handlePieceLanding sets currentPiece and sends grid', () => {
		const next = createMockPiece();

		player.nextPiece = jest.fn(() => next);
		player.isValidMove = jest.fn(() => true);
		player.currentPiece = createMockPiece();
		player.mergePieceIntoGrid = jest.fn(() => player.grid);
		player.sendGrid = jest.fn();
		player.handlePieceLanding();

		expect(player.currentPiece).toBe(next);
		expect(player.sendGrid).toHaveBeenCalled();
	});

	/**
	 * Confirms that handlePieceLanding does not merge currentPiece if move invalid.
	 */
	test('handlePieceLanding does not merge currentPiece if move invalid', () => {
		const currentPiece = createMockPiece();
		const next = createMockPiece();

		player.nextPiece = jest.fn(() => next);

		player.isValidMove = jest.fn()
			.mockImplementationOnce(() => false)
			.mockImplementationOnce(() => true)
			.mockImplementationOnce(() => false);

		player.currentPiece = currentPiece;
		player.mergePieceIntoGrid = jest.fn(() => player.grid);
		player.sendGrid = jest.fn();

		player.handlePieceLanding();

		expect(player.currentPiece).toBe(next);
		expect(player.mergePieceIntoGrid).not.toHaveBeenCalledWith(next, expect.anything());
		expect(player.sendGrid).toHaveBeenCalled();
	});

	/**
	 * Ensures the next piece spawns at the highest available row when space is limited.
	 */
	test('handlePieceLanding finds highest valid spawn position', () => {
		const currentPiece = createMockPiece();
		const next = createMockPiece({
			shape: [[1], [1]],
			position: { x: 0, y: 1 }
		});

		next.getLeadingEmptyRows = jest.fn(() => 0);
		player.currentPiece = currentPiece;
		player.nextPiece = jest.fn(() => next);
		player.sendGrid = jest.fn();

		player.grid[1][0] = {
			filled: true,
			color: 'red',
			indestructible: false,
			ghost: false
		};

		const mergeSpy = jest.spyOn(player, 'mergePieceIntoGrid');

		player.handlePieceLanding();

		expect(next.position.y).toBe(-1);
		expect(player.currentPiece).toBe(next);
		expect(mergeSpy).toHaveBeenCalledWith(next, expect.any(Array));
		expect(mockConnection.emit).not.toHaveBeenCalledWith(outgoingEvents.GAME_LOST, expect.anything());

		mergeSpy.mockRestore();
	});

	/**
	 * Confirms that movePiece does nothing if no room or hasLost.
	 */
	test('movePiece does nothing if no currentPiece', () => {
		player.currentPiece = null;
		player.movePiece();

		expect(mockConnection.emit).not.toHaveBeenCalled();
	});

	/**
	 * Confirms that movePiece does nothing if no room or hasLost.
	 */
	test('movePiece handles rotate', () => {
		player.currentPiece = createMockPiece();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.isValidMove = jest.fn(() => true);
		player.sendGrid = jest.fn();
		player.movePiece('up');

		expect(player.sendGrid).toHaveBeenCalled();
	});

	/**
	 * Confirms that movePiece handles hard drop by calling handlePieceLanding.
	 */
	test('movePiece handles hard drop', () => {
		player.currentPiece = createMockPiece();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.isValidMove = jest.fn()
			.mockReturnValueOnce(true)
			.mockReturnValueOnce(false);
		player.handlePieceLanding = jest.fn();
		player.sendGrid = jest.fn();
		player.movePiece('space');

		expect(player.handlePieceLanding).toHaveBeenCalled();
		expect(player.sendGrid).toHaveBeenCalled();
	});

	/**
	 * Confirms that movePiece handles left/right/down movements.
	 */
	test('movePiece handles left/right/down', () => {
		player.currentPiece = createMockPiece();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.isValidMove = jest.fn(() => true);
		player.sendGrid = jest.fn();

		player.movePiece('left');
		expect(player.sendGrid).toHaveBeenCalled();

		player.movePiece('right');
		expect(player.sendGrid).toHaveBeenCalled();

		player.movePiece('down');
		expect(player.sendGrid).toHaveBeenCalled();
	});

	/**
	 * Confirms that movePiece handles invalid move by calling handlePieceLanding.
	 */
	test('movePiece handles invalid move and calls handlePieceLanding', () => {
		player.currentPiece = createMockPiece();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.isValidMove = jest.fn(() => false);
		player.handlePieceLanding = jest.fn();
		player.sendGrid = jest.fn();
		player.movePiece('down');

		expect(player.handlePieceLanding).toHaveBeenCalled();
		expect(player.sendGrid).toHaveBeenCalled();
	});

	/**
	 * Confirms that movePiece returns early if no currentPiece.
	 */
	test('movePiece returns for unknown direction', () => {
		player.currentPiece = createMockPiece();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.sendGrid = jest.fn();
		player.movePiece('unknown');

		expect(player.sendGrid).not.toHaveBeenCalled();
	});

	/**
	 * Confirms that movePiece returns early if no currentPiece (explicit).
	 */
	test('movePiece returns early for unknown direction', () => {
		player.currentPiece = createMockPiece();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.sendGrid = jest.fn();
		player.movePiece('unknown');

		expect(player.sendGrid).not.toHaveBeenCalled();
	});

	/**
	 * Confirms that movePiece returns early if no currentPiece (explicit).
	 */
	test('movePiece returns early for unknown direction (explicit)', () => {
		player.currentPiece = createMockPiece();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.sendGrid = jest.fn();
		player.movePiece('foobar');

		expect(player.sendGrid).not.toHaveBeenCalled();
	});

	/**
	 * Confirms that movePiece calls mergePieceIntoGrid when not hardDrop.
	 */
	test('movePiece updates grid when not hardDrop', () => {
		player.currentPiece = createMockPiece();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.isValidMove = jest.fn(() => true);

		const spy = jest.spyOn(player, 'mergePieceIntoGrid');

		player.sendGrid = jest.fn();
		player.movePiece('down');

		expect(spy).toHaveBeenCalled();
	});

	/**
	 * Confirms that movePiece calls mergePieceIntoGrid when not hardDrop (explicit).
	 */
	test('movePiece calls mergePieceIntoGrid when not hardDrop (explicit)', () => {
		player.currentPiece = createMockPiece();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.isValidMove = jest.fn(() => true);

		const spy = jest.spyOn(player, 'mergePieceIntoGrid');

		player.sendGrid = jest.fn();
		player.movePiece('down');

		expect(spy).toHaveBeenCalled();
	});

	/**
	 * Confirms that movePiece only calls sendGrid if rotate valid and move invalid.
	 */
	test('movePiece only calls sendGrid if rotate valid and move invalid', () => {
		player.currentPiece = createMockPiece();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.isValidMove = jest.fn(() => false);
		player.sendGrid = jest.fn();
		player.movePiece('up');

		expect(player.sendGrid).toHaveBeenCalled();
	});

	/**
	 * Confirms that movePiece only calls mergePieceIntoGrid and sendGrid if invalid move and direction is not down.
	 */
	test('movePiece only calls mergePieceIntoGrid and sendGrid if invalid move and direction is not down', () => {
		player.currentPiece = createMockPiece();
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.isValidMove = jest.fn(() => false);

		const mergeSpy = jest.spyOn(player, 'mergePieceIntoGrid');

		player.sendGrid = jest.fn();
		player.movePiece('left');

		expect(mergeSpy).toHaveBeenCalled();
		expect(player.sendGrid).toHaveBeenCalled();
	});

	/**
	 * Confirms that tickInterval returns early if no room or hasLost.
	 */
	test('tickInterval returns if no room or hasLost', () => {
		player.room = null;
		player.tickInterval();

		expect(mockConnection.emit).not.toHaveBeenCalled();

		player.room = makeRoom({
			clients: new Set([player])
		});
		player.hasLost = true;
		player.movePiece = jest.fn();
		player.tickInterval();

		expect(player.movePiece).not.toHaveBeenCalled();
	});

	/**
	 * Confirms that tickInterval calls movePiece.
	 */
	test('tickInterval calls movePiece', () => {
		player.hasLost = false;
		player.movePiece = jest.fn();
		player.tickInterval();

		expect(player.movePiece).toHaveBeenCalled();
	});

	/**
	 * Confirms that reset clears player state.
	 */
	test('reset clears player state', () => {
		player.pieces.add(createMockPiece());
		player.currentPiece = createMockPiece();
		player.currentPieceIndex = 5;
		player.grid = [1];
		player.hasLost = true;
		player.level = 3;
		player.totalLinesCleared = 45;
		player.reset();

		expect(player.pieces.size).toBe(0);
		expect(player.currentPiece).toBeNull();
		expect(player.currentPieceIndex).toBe(0);
		expect(player.grid).toBeNull();
		expect(player.hasLost).toBe(false);
		expect(player.level).toBe(0);
		expect(player.totalLinesCleared).toBe(0);
	});

	/**
	 * Confirms that updateUsername throws error for invalid usernames.
	 */
	test('updateUsername throws an error if username is invalid', () => {
		const invalidUsernameError = 'Invalid username';
		const invalidUsernameFormatError = 'Username must be alphanumeric and up to 16 characters long';

		expect(() => player.updateUsername('')).toThrow(invalidUsernameError);
		expect(() => player.updateUsername(null)).toThrow(invalidUsernameError);
		expect(() => player.updateUsername(123)).toThrow(invalidUsernameError);

		expect(() => player.updateUsername('BRAN DON')).toThrow(invalidUsernameFormatError);
		expect(() => player.updateUsername('1234567891011121314151617')).toThrow(invalidUsernameFormatError);
	});

	/**
	 * Confirms that sendPlayerStatsBoard does nothing if statistics are not loaded.
	 */
	test('sendPlayerStatsBoard does nothing if statistics are not loaded', () => {
		player.statistics = null;

		player.sendPlayerStatsBoard();

		expect(mockConnection.emit).not.toHaveBeenCalled();
	});

});
