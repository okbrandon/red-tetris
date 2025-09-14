/**
 * @constant {number} FRAME_COLS - The number of columns in the game grid (default is 10).
 */
const FRAME_COLS = 10;

/**
 * @constant {number} FRAME_ROWS - The number of rows in the game grid (default is 20).
 */
const FRAME_ROWS = 20;

/**
 * @constant {number} DEFAULT_PIECE_COUNT - The default number of pieces available in the game.
 */
const DEFAULT_PIECE_COUNT = 1000;

/**
 * @constant {Array<Array<Object>>} DEFAULT_EMPTY_GRID - The default empty game grid, which is a 2D array representing the grid.
 * Each cell in the grid is an object with properties:
 * - `filled`: Boolean indicating whether the cell is filled or not.
 * - `color`: String representing the color of the cell (default is 'transparent').
 * - `indestructible`: Boolean indicating whether the cell is indestructible.
 * - `ghost`: Boolean indicating whether the cell is part of a ghost piece.
 */
const DEFAULT_EMPTY_GRID = Array.from({ length: FRAME_ROWS }, () => Array(FRAME_COLS).fill({
		filled: false,
		color: 'transparent',
		indestructible: false,
		ghost: false,
	}));

export {
	FRAME_COLS,
	FRAME_ROWS,
	DEFAULT_PIECE_COUNT,
	DEFAULT_EMPTY_GRID
};
