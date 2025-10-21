import {
  CELL_SIZE,
  DEFAULT_BOARD_COLS,
  DEFAULT_BOARD_ROWS,
} from '@/utils/tetris';

export const OPPONENT_CELL_SIZE = Math.max(12, Math.floor(CELL_SIZE * 0.5));
export const DEFAULT_ROWS = DEFAULT_BOARD_ROWS;
export const DEFAULT_COLS = DEFAULT_BOARD_COLS;
