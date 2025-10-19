export const DEFAULT_BOARD_ROWS = 20;
export const DEFAULT_BOARD_COLS = 10;

export const PIECE_COLOR_MAP = Object.freeze({
  1: 'rgba(0,229,255,1)',
  2: 'rgba(255,149,0,1)',
  3: 'rgba(0,122,255,1)',
  4: 'rgba(255,59,48,1)',
  5: 'rgba(255,214,10,1)',
  6: 'rgba(191,90,242,1)',
  7: 'rgba(52,199,89,1)',
  8: 'rgba(120,120,150,1)',
});

const BASE_COLORS = {
  default: 'rgba(162,89,255,0.86)',
  empty: 'rgba(20,20,25,0.35)',
  ghost: 'rgba(208,204,255,0.18)',
  transparent: 'rgba(0,0,0,0)',
  indestructible: 'rgba(110,110,140,1)',
  gray: 'rgba(154,154,189,0.85)',
};

const NAMED_COLORS = {
  cyan: PIECE_COLOR_MAP[1],
  orange: PIECE_COLOR_MAP[2],
  blue: PIECE_COLOR_MAP[3],
  red: PIECE_COLOR_MAP[4],
  yellow: PIECE_COLOR_MAP[5],
  purple: PIECE_COLOR_MAP[6],
  green: PIECE_COLOR_MAP[7],
};

export const BASE_TETRIS_COLORS = Object.freeze({
  ...BASE_COLORS,
  ...PIECE_COLOR_MAP,
  ...NAMED_COLORS,
});

export const deriveBoardDimensions = (
  board,
  defaultRows = DEFAULT_BOARD_ROWS,
  defaultCols = DEFAULT_BOARD_COLS
) => {
  if (Array.isArray(board) && board.length > 0 && Array.isArray(board[0])) {
    return { rows: board.length, cols: board[0].length };
  }
  return { rows: defaultRows, cols: defaultCols };
};

export const extractPieceBlocks = (piece, { preferShape = false } = {}) => {
  if (!piece) return [];
  if (!preferShape && Array.isArray(piece.blocks)) return piece.blocks;
  if (!Array.isArray(piece.shape)) return [];

  const blocks = [];
  for (let y = 0; y < piece.shape.length; y += 1) {
    for (let x = 0; x < piece.shape[y].length; x += 1) {
      if (piece.shape[y][x]) {
        blocks.push([x, y]);
      }
    }
  }
  return blocks;
};
