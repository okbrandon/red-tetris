import {
  BASE_TETRIS_COLORS,
  DEFAULT_BOARD_COLS,
  DEFAULT_BOARD_ROWS,
  deriveBoardDimensions,
  extractPieceBlocks,
  setAlpha,
  normalizeCell,
  normalizeGrid,
  normalizeActivePiece,
  computeStats,
} from '../tetris.js';

const createPalette = () => ({
  ...BASE_TETRIS_COLORS,
  custom: '#123456',
});

describe('tetris utilities', () => {
  describe('deriveBoardDimensions', () => {
    it('derives the shape from a provided grid', () => {
      const board = [
        [0, 0, 0],
        [0, 0, 0],
      ];
      expect(deriveBoardDimensions(board)).toEqual({ rows: 2, cols: 3 });
    });

    it('falls back to defaults when the grid is invalid', () => {
      expect(deriveBoardDimensions(null)).toEqual({
        rows: DEFAULT_BOARD_ROWS,
        cols: DEFAULT_BOARD_COLS,
      });
    });
  });

  describe('extractPieceBlocks', () => {
    it('prefers the explicit blocks array when present', () => {
      const piece = {
        blocks: [
          [0, 0],
          [1, 0],
        ],
      };
      expect(extractPieceBlocks(piece)).toEqual([
        [0, 0],
        [1, 0],
      ]);
    });

    it('builds blocks from the shape when requested', () => {
      const piece = {
        shape: [
          [0, 1],
          [1, 1],
        ],
      };
      expect(extractPieceBlocks(piece, { preferShape: true })).toEqual([
        [1, 0],
        [0, 1],
        [1, 1],
      ]);
    });

    it('handles missing data gracefully', () => {
      expect(extractPieceBlocks(null)).toEqual([]);
      expect(extractPieceBlocks({})).toEqual([]);
    });
  });

  describe('setAlpha', () => {
    it('updates rgba and rgb strings', () => {
      expect(setAlpha('rgba(10, 20, 30, 0.5)', 0.3)).toBe(
        'rgba(10, 20, 30, 0.3)'
      );
      expect(setAlpha('rgb(10,20,30)', 0.8)).toBe('rgba(10, 20, 30, 0.8)');
    });

    it('converts hex values to rgba', () => {
      expect(setAlpha('#0f0', 0.25)).toBe('rgba(0, 255, 0, 0.25)');
      expect(setAlpha('#112233', 0.9)).toBe('rgba(17, 34, 51, 0.9)');
    });

    it('returns the input when no conversion is possible', () => {
      expect(setAlpha('red', 0.5)).toBe('red');
    });

    it('falls back to black with custom alpha when colour is missing', () => {
      expect(setAlpha(undefined, 0.2)).toBe('rgba(0,0,0,0.2)');
    });
  });

  describe('normalizeCell', () => {
    it('derives colours based on cell properties', () => {
      const palette = createPalette();
      const cell = normalizeCell({ filled: true, color: 'custom' }, palette);

      expect(cell.filled).toBe(true);
      expect(cell.color).toBe('#123456');
      expect(cell.shadowColor).toBe('rgba(18, 52, 86, 0.45)');
    });

    it('handles ghost and indestructible cells specially', () => {
      const palette = createPalette();
      const ghostCell = normalizeCell(
        { ghost: true, color: 'custom' },
        palette
      );
      const rockCell = normalizeCell(
        { indestructible: true, color: 'custom' },
        palette
      );

      expect(ghostCell.filled).toBe(false);
      expect(ghostCell.color).toBe(palette.ghost);
      expect(rockCell.color).toBe(palette.indestructible);
    });

    it('uses palette defaults when no colour is supplied', () => {
      const palette = { ...createPalette(), empty: '#010203' };
      const cell = normalizeCell({}, palette);

      expect(cell.color).toBe('#010203');
    });

    it('falls back to the base empty colour when none is provided', () => {
      const palette = { ...createPalette() };
      delete palette.empty;
      const cell = normalizeCell({}, palette);

      expect(cell.color).toBe(BASE_TETRIS_COLORS.empty);
    });
  });

  describe('normalizeGrid', () => {
    it('normalizes every cell in the provided grid', () => {
      const palette = createPalette();
      const grid = [[{ filled: true }], [{}]];
      const normalized = normalizeGrid(grid, 2, 1, palette);

      expect(normalized).toHaveLength(2);
      expect(normalized[0][0].filled).toBe(true);
      expect(normalized[1][0].filled).toBe(false);
    });

    it('fills gaps when source rows are missing', () => {
      const palette = createPalette();
      const normalized = normalizeGrid(undefined, 1, 1, palette);

      expect(normalized[0][0].filled).toBe(false);
    });
  });

  describe('normalizeActivePiece', () => {
    it('returns null when the piece is invalid', () => {
      expect(normalizeActivePiece(null, createPalette())).toBeNull();
      expect(normalizeActivePiece({}, createPalette())).toBeNull();
    });

    it('normalizes a valid piece using palette colours', () => {
      const piece = {
        shape: [
          [1, 1],
          [0, 1],
        ],
        color: 'custom',
        position: { x: 3, y: 4 },
      };

      const palette = createPalette();
      const normalized = normalizeActivePiece(piece, palette);

      expect(normalized.blocks).toEqual([
        [0, 0],
        [1, 0],
        [1, 1],
      ]);
      expect(normalized.position).toEqual({ x: 3, y: 4 });
      expect(normalized.color).toBe('#123456');
      expect(normalized.shadowColor).toBe('rgba(18, 52, 86, 0.45)');
    });

    it('returns null when the piece has no active blocks', () => {
      const piece = { shape: [[0, 0]] };
      expect(normalizeActivePiece(piece, createPalette())).toBeNull();
    });

    it('falls back to the raw colour when missing from the palette', () => {
      const palette = createPalette();
      const piece = {
        shape: [[1]],
        color: '#abcdef',
      };

      const normalized = normalizeActivePiece(piece, palette);
      expect(normalized.color).toBe('#abcdef');
    });

    it('uses the palette default when no colour is supplied', () => {
      const palette = { ...createPalette(), default: '#001122' };
      const piece = { shape: [[1]] };
      const normalized = normalizeActivePiece(piece, palette);

      expect(normalized.color).toBe('#001122');
    });
  });

  describe('computeStats', () => {
    it('collects available numeric stats', () => {
      const stats = computeStats({
        score: 1000,
        stats: { linesCleared: 12, level: 3 },
      });

      expect(stats).toEqual([
        { label: 'Score', value: 1000 },
        { label: 'Lines', value: 12 },
        { label: 'Level', value: 3 },
      ]);
    });

    it('returns an empty array for invalid input', () => {
      expect(computeStats(null)).toEqual([]);
    });

    it('pulls fallback stats when values are on the player object', () => {
      const stats = computeStats({ score: 500, linesCleared: 4, level: 2 });
      expect(stats).toEqual([
        { label: 'Score', value: 500 },
        { label: 'Lines', value: 4 },
        { label: 'Level', value: 2 },
      ]);
    });
  });
});
