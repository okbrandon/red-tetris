import { expect, jest } from '@jest/globals';
import gameSettings from '../constants/game-settings.js';
import gameStatus from '../constants/game-status.js';
import outgoingEvents from '../constants/outgoing-events.js';
import Player from '../player.js';
import { createMockPiece } from '../__mocks__/_mockPiece.js';

describe('Player', () => {

	let mockConnection;
	let player;

	/**
	 * Sets up a fresh Player instance and mock connection before each test.
	 */
	beforeEach(() => {
		mockConnection = {
			send: jest.fn(),
			emit: jest.fn()
		};
		player = new Player(mockConnection, 'player1', 'Alice');
		player.room = {
			id: 'room1',
			owner: { id: 'owner1', username: 'Owner' },
			status: gameStatus.WAITING,
			soloJourney: false,
			rows: gameSettings.FRAME_ROWS,
			cols: gameSettings.FRAME_COLS,
			clients: new Set([player]),
			handlePenalties: jest.fn(),
			broadcastLinesCleared: jest.fn()
		};
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.pieces = new Set([createMockPiece(), createMockPiece({ color: 'blue' })]);
		player.currentPiece = createMockPiece();
		player.currentPieceIndex = 0;
		player.hasLost = false;
	});

	/**
	 * Cleans up after each test.
	 */
	afterEach(() => {
		mockConnection = null;

		if (player && typeof player.isValidMove === 'function' && player.isValidMove._isMockFunction) {
			player.isValidMove = Player.prototype.isValidMove;
		}

		player = null;
	});

	/**
	 * Tests for Player class methods and properties.
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
	});

	/**
	 * Confirms that username defaults to null when not provided.
	 */
	test('constructor sets username to null if not provided', () => {
		const p = new Player(mockConnection, 'id');

		expect(p.username).toBeNull();
	});

	/**
	 * Tests that send calls connection.send with the correct message.
	 */
	test('send calls connection.send', () => {
		player.send('msg');

		expect(mockConnection.send).toHaveBeenCalledWith('msg');
	});

	/**
	 * Tests that emit calls connection.emit with the correct event and data.
	 */
	test('emit calls connection.emit', () => {
		player.emit('event', { foo: 1 });

		expect(mockConnection.emit).toHaveBeenCalledWith('event', { foo: 1 });
	});

	/**
	 * Tests that sendGrid emits GAME_STATE with the correct data structure.
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
	 * Confirms that sendGrid emits GAME_STATE with empty nextPieces if less than 2 pieces.
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
	 * Confirms that sendGameOver sets hasLost and emits GAME_OVER event.
	 */
	test('sendGameOver sets hasLost and emits GAME_OVER', () => {
		player.hasLost = false;
		player.sendGameOver('Lost!');

		expect(player.hasLost).toBe(true);
		expect(mockConnection.emit).toHaveBeenCalledWith(outgoingEvents.GAME_OVER, expect.objectContaining({
			room: expect.objectContaining({ id: 'room1' }),
			message: 'Lost!'
		}));
	});

	/**
	 * Confirms that sendGameOver does nothing if player has already lost.
	 */
	test('sendGameOver does nothing if already lost', () => {
		player.hasLost = true;
		player.sendGameOver('Lost!');

		expect(mockConnection.emit).not.toHaveBeenCalledWith(outgoingEvents.GAME_OVER, expect.anything());
	});

	/**
	 * Confirms that nextPiece returns null if no pieces are available.
	 */
	test('nextPiece returns null if no pieces', () => {
		player.pieces.clear();

		expect(player.nextPiece()).toBeNull();
	});

	/**
	 * Confirms that nextPiece returns the next piece and increments the index.
	 */
	test('nextPiece returns next piece and increments index', () => {
		const first = Array.from(player.pieces)[0];

		expect(player.nextPiece()).toBe(first);
		expect(player.currentPieceIndex).toBe(1);
	});

	/**
	 * Confirms that nextPiece wraps index when exceeding pieces size.
	 */
	test('getGhostPiece returns null if no currentPiece', () => {
		player.currentPiece = null;

		expect(player.getGhostPiece(player.grid)).toBeNull();
	});

	/**
	 * Confirms that getGhostPiece returns a ghost piece with the correct y position.
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
	 * Confirms that getLandSpecter returns DEFAULT_EMPTY_GRID if no grid or currentPiece.
	 */
	test('getLandSpecter returns DEFAULT_EMPTY_GRID if no grid or currentPiece', () => {
		player.grid = null;

		expect(player.getLandSpecter()).toBe(gameSettings.DEFAULT_EMPTY_GRID);

		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.currentPiece = null;

		expect(player.getLandSpecter()).toBe(gameSettings.DEFAULT_EMPTY_GRID);
	});

	/**
	 * Confirms that getLandSpecter returns a gray overlay grid.
	 */
	test('getLandSpecter returns a gray overlay grid', () => {
		player.grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		player.currentPiece = createMockPiece();
		player.grid[gameSettings.FRAME_ROWS - 1][0] = { filled: true, color: 'red', indestructible: false, ghost: false };

		const specter = player.getLandSpecter();

		expect(specter[gameSettings.FRAME_ROWS - 1][0].color).toBe('gray');
	})

	/**
	 * Confirms that generateEmptyGrid sets grid to DEFAULT_EMPTY_GRID.
	 */
	test('generateEmptyGrid sets grid to DEFAULT_EMPTY_GRID', () => {
		player.grid = null;
		player.generateEmptyGrid();

		expect(player.grid).toEqual(gameSettings.DEFAULT_EMPTY_GRID);
	});

	/**
	 * Confirms that isValidMove returns false for out of bounds.
	 */
	test('isValidMove returns false for out of bounds', () => {
		const piece = createMockPiece();

		expect(player.isValidMove(piece, player.grid, { x: -1, y: 0 })).toBe(false);
		expect(player.isValidMove(piece, player.grid, { x: 100, y: 0 })).toBe(false);
		expect(player.isValidMove(piece, player.grid, { x: 0, y: -1 })).toBe(false);
		expect(player.isValidMove(piece, player.grid, { x: 0, y: 100 })).toBe(false);
	});

	/**
	 * Confirms that isValidMove returns false for filled cell.
	 */
	test('isValidMove returns false for filled cell', () => {
		const piece = createMockPiece();

		player.grid[0][0].filled = true;

		expect(player.isValidMove(piece, player.grid, { x: 0, y: 0 })).toBe(false);
	});

	/**
	 * Confirms that isValidMove returns true for valid move.
	 */
	test('isValidMove returns true for valid move', () => {
		const piece = createMockPiece();

		expect(player.isValidMove(piece, player.grid, { x: 0, y: 0 })).toBe(true);
	});

	/**
	 * Confirms that isValidMove uses rotated shape when rotate=true.
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
	 * Confirms that isValidMove returns true for valid move (explicit final return).
	 */
	test('isValidMove returns true for valid move (explicit final return)', () => {
		const piece = createMockPiece({ shape: [[1]], position: { x: 0, y: 0 } });

		player.room.rows = 1;
		player.room.cols = 1;

		const grid = [[{ filled: false }]];

		expect(player.isValidMove(piece, grid, { x: 0, y: 0 })).toBe(true);
	});

	/**
	 * Confirms that isValidMove skips empty cells in shape.
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
	 * Confirms that updatePieceOnGrid updates grid cells.
	 */
	test('updatePieceOnGrid updates grid cells', () => {
		const piece = createMockPiece();
		const grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		const updated = player.updatePieceOnGrid(piece, grid, () => ({ filled: true, color: 'red', indestructible: false, ghost: false }));

		expect(updated[0][0].filled).toBe(true);
	});

	/**
	 * Confirms that updatePieceOnGrid iterates over shape and updates grid.
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
	 * Confirms that updatePieceOnGrid does not update indestructible cells.
	 */
	test('updatePieceOnGrid does not update indestructible cells', () => {
		const piece = createMockPiece();
		const grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);

		// piece at (0,0) and make that cell indestructible
		piece.position = { x: 0, y: 0 };
		grid[0][0] = { filled: false, color: 'transparent', indestructible: true, ghost: false };

		const updateCell = jest.fn(() => ({ filled: true, color: 'red', indestructible: false, ghost: false }));
		const updated = player.updatePieceOnGrid(piece, grid, updateCell);

		// cell should remain indestructible and not be updated
		expect(updated[0][0]).toEqual({ filled: false, color: 'transparent', indestructible: true, ghost: false });
		expect(updateCell).not.toHaveBeenCalled();
	});

	/**
	 * Confirms that updatePieceOnGrid returns original grid if piece is null.
	 */
	test('mergePieceIntoGrid calls updatePieceOnGrid', () => {
		const piece = createMockPiece();
		const grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		const spy = jest.spyOn(player, 'updatePieceOnGrid');

		player.mergePieceIntoGrid(piece, grid);

		expect(spy).toHaveBeenCalled();
	});

	/**
	 * Confirms that removePieceFromGrid calls updatePieceOnGrid.
	 */
	test('removePieceFromGrid calls updatePieceOnGrid', () => {
		const piece = createMockPiece();
		const grid = structuredClone(gameSettings.DEFAULT_EMPTY_GRID);
		const spy = jest.spyOn(player, 'updatePieceOnGrid');

		player.removePieceFromGrid(piece, grid);

		expect(spy).toHaveBeenCalled();
	});

	/**
	 * Confirms that penalize does nothing if grid is null.
	 */
	test('penalize does nothing if no grid', () => {
		player.grid = null;
		player.penalize(2);

		expect(player.grid).toBeNull();
	});

	/**
	 * Confirms that penalize adds penalty lines to the grid.
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
	 * Confirms that handlePieceLanding sends GAME_OVER if next piece cannot move.
	 */
	test('handlePieceLanding sends game over if next piece cannot move', () => {
		player.nextPiece = jest.fn(() => createMockPiece());
		player.isValidMove = jest.fn(() => false);
		player.currentPiece = createMockPiece();
		player.handlePieceLanding();

		expect(mockConnection.emit).toHaveBeenCalledWith(outgoingEvents.GAME_OVER, expect.anything());
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

		player.room = {
			...player.room,
			clients: new Set([player]),
			handlePenalties: jest.fn(),
			rows: gameSettings.FRAME_ROWS,
			cols: gameSettings.FRAME_COLS
		};
		player.hasLost = true;
		player.tickInterval();

		expect(mockConnection.emit).not.toHaveBeenCalled();
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
		player.reset();

		expect(player.pieces.size).toBe(0);
		expect(player.currentPiece).toBeNull();
		expect(player.currentPieceIndex).toBe(0);
		expect(player.grid).toBeNull();
		expect(player.hasLost).toBe(false);
	});
});
