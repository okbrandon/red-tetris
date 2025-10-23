import { CELL_SIZE, DEFAULT_BOARD_ROWS } from './tetris';

export const deriveCardScale = (count) => {
  if (count <= 1) return 1;
  if (count === 2) return 0.95;
  if (count === 3) return 0.9;
  const scaled = 0.9 - (count - 3) * 0.045;
  return Math.max(scaled, 0.6);
};

export const estimateOpponentCellSize = (opponentCount) => {
  const preferred = Math.max(10, Math.floor(CELL_SIZE * 0.45));
  const minimum = Math.max(4, Math.floor(CELL_SIZE * 0.18));
  const maximum = Math.max(preferred, Math.floor(CELL_SIZE * 0.55));

  if (!opponentCount) {
    return Math.max(minimum, Math.min(preferred, maximum));
  }

  if (typeof window === 'undefined') {
    return Math.max(minimum, Math.min(preferred, maximum));
  }

  const { innerHeight: height, innerWidth: width } = window;
  const arenaPadding = width >= 880 ? 80 : 48;
  const columnPadding = width >= 880 ? 56 : 40;
  const spacing = width >= 880 ? 18 : 14;
  const paddingAdjustedHeight =
    Math.max(height - arenaPadding, 320) - columnPadding;
  const availablePerCard =
    (paddingAdjustedHeight - spacing * Math.max(opponentCount - 1, 0)) /
    opponentCount;

  const chromeAllowance = 64;
  const heightRatio = (availablePerCard - chromeAllowance) / DEFAULT_BOARD_ROWS;
  const heightBound = Number.isFinite(heightRatio)
    ? Math.floor(heightRatio)
    : preferred;
  const safeCandidate = heightBound > 0 ? heightBound : minimum;

  const soloCap = Math.max(minimum, Math.floor(CELL_SIZE * 0.42));
  const duoCap = Math.max(minimum, Math.floor(CELL_SIZE * 0.36));
  const tierCap =
    opponentCount === 1
      ? Math.min(maximum, soloCap)
      : opponentCount === 2
        ? Math.min(maximum, duoCap)
        : maximum;

  return Math.max(minimum, Math.min(safeCandidate, tierCap));
};

const MIN_PREVIEW_CELL_SIZE = 3;
const PREVIEW_SCALE = 0.5;
const MAX_PREVIEW_HEIGHT = 118;
const MAX_PREVIEW_WIDTH = 148;
const BOARD_PADDING = 6;

export const derivePreviewCellSize = ({
  opponentCount = 0,
  rows = DEFAULT_BOARD_ROWS,
  cols = 10,
} = {}) => {
  const safeRows = Math.max(1, rows);
  const safeCols = Math.max(1, cols);
  const baseSize = estimateOpponentCellSize(opponentCount);
  const scaled = Math.floor(baseSize * PREVIEW_SCALE);
  const heightBound = Math.floor(
    (MAX_PREVIEW_HEIGHT - BOARD_PADDING) / safeRows
  );
  const widthBound = Math.floor((MAX_PREVIEW_WIDTH - BOARD_PADDING) / safeCols);
  const candidate = Math.min(scaled, heightBound, widthBound);
  return Math.max(MIN_PREVIEW_CELL_SIZE, candidate);
};

export const computePrimaryCellSize = () => {
  if (typeof window === 'undefined') return 32;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const sidebarWidth = w >= 880 ? Math.min(Math.max(w * 0.34, 280), 400) : 0;
  const layoutPadding = w >= 880 ? 64 : 32;
  const availableWidth = w - sidebarWidth - layoutPadding;
  const widthBased = availableWidth / 10;
  const verticalPadding = Math.max(h * 0.3, 260);
  const availableHeight = Math.max(h - verticalPadding, 240);
  const heightBased = availableHeight / 20;
  const raw = Math.floor(Math.min(widthBased, heightBased));
  return Math.max(20, Math.min(raw, 42));
};
