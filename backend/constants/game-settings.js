const FRAME_COLS = 10;

const FRAME_ROWS = 20;

const DEFAULT_PIECE_COUNT = 1000;

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
