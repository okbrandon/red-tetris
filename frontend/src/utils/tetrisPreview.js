import { BASE_TETRIS_COLORS } from '@/utils/tetris.js';
import { normalizeActivePiece } from '@/utils/tetris.js';

export const DEFAULT_PREVIEW_ROWS = 4;
export const DEFAULT_PREVIEW_COLS = 4;

export const buildPreviewMatrix = (
  blocks,
  rows = DEFAULT_PREVIEW_ROWS,
  cols = DEFAULT_PREVIEW_COLS
) => {
  const safeRows = Math.max(0, rows);
  const safeCols = Math.max(0, cols);
  const matrix = Array.from({ length: safeRows }, () =>
    Array(safeCols).fill(0)
  );

  if (
    !Array.isArray(blocks) ||
    blocks.length === 0 ||
    safeRows === 0 ||
    safeCols === 0
  ) {
    return matrix;
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const [x, y] of blocks) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }

  if (
    !Number.isFinite(minX) ||
    !Number.isFinite(minY) ||
    !Number.isFinite(maxX) ||
    !Number.isFinite(maxY)
  ) {
    return matrix;
  }

  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const offsetX = Math.floor((safeCols - width) / 2) - minX;
  const offsetY = Math.floor((safeRows - height) / 2) - minY;

  for (const [bx, by] of blocks) {
    const x = bx + offsetX;
    const y = by + offsetY;
    if (x >= 0 && x < safeCols && y >= 0 && y < safeRows) {
      matrix[y][x] = 1;
    }
  }

  return matrix;
};

const resolveColorFromPiece = (piece, palette, fallbackKey = 1) => {
  if (piece?.color) {
    const paletteMatch = palette[piece.color];
    if (paletteMatch) return paletteMatch;
    return piece.color;
  }
  return palette[fallbackKey];
};

export const createPreviewData = (piece) => {
  const normalizedPiece = normalizeActivePiece(piece, BASE_TETRIS_COLORS);
  const matrix = buildPreviewMatrix(
    normalizedPiece?.blocks,
    DEFAULT_PREVIEW_ROWS,
    DEFAULT_PREVIEW_COLS
  );

  const color =
    normalizedPiece?.color ??
    resolveColorFromPiece(piece, BASE_TETRIS_COLORS) ??
    BASE_TETRIS_COLORS.default ??
    'rgba(0,0,0,0)';

  return {
    matrix,
    color,
    piece: normalizedPiece,
  };
};
