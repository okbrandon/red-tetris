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

/**
 * @constant {number} MAX_PLAYERS_PER_ROOM - The maximum number of players allowed in a game room (default is 4).
 */
const MAX_PLAYERS_PER_ROOM = 4;

/**
 * @constant {string} TAG_SINGLEPLAYER - The tag used for singleplayer game IDs.
 */
const TAG_SINGLEPLAYER = '@';

/**
 * @constant {RegExp} NAME_VALIDATION_REGEX - The regex pattern used to validate names and room names.
 */
const NAME_VALIDATION_REGEX = /^[a-zA-Z0-9_-]+$/;

/**
 * @constant {Object} BPS_SCORING - The scoring system based on the number of lines cleared at once.
 * Based on classic Tetris scoring:
 * - 1 (Single) line: 40 points
 * - 2 (Double) lines: 100 points
 * - 3 (Triple) lines: 300 points
 * - 4 (Tetris) lines: 1200 points
 */
const BPS_SCORING = {
	1: { points: 40, description: 'Single' },
	2: { points: 100, description: 'Double' },
	3: { points: 300, description: 'Triple' },
	4: { points: 1200, description: 'Tetris' }
};

export default {
	FRAME_COLS,
	FRAME_ROWS,
	DEFAULT_PIECE_COUNT,
	DEFAULT_EMPTY_GRID,
	MAX_PLAYERS_PER_ROOM,
	TAG_SINGLEPLAYER,
	NAME_VALIDATION_REGEX,
	BPS_SCORING
};
