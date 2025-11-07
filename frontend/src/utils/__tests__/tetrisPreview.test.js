import { vi } from 'vitest';
import {
  buildPreviewMatrix,
  createPreviewData,
  DEFAULT_PREVIEW_COLS,
  DEFAULT_PREVIEW_ROWS,
} from '../tetrisPreview.js';
import { BASE_TETRIS_COLORS } from '../tetris.js';

describe('tetrisPreview utilities', () => {
  describe('buildPreviewMatrix', () => {
    it('returns an empty matrix when no blocks are provided', () => {
      const matrix = buildPreviewMatrix(null, 3, 3);
      expect(matrix).toEqual([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]);
    });

    it('handles zero-dimension previews gracefully', () => {
      const matrix = buildPreviewMatrix([[0, 0]], 0, 0);
      expect(matrix).toEqual([]);
    });

    it('ignores blocks that fall outside the preview bounds', () => {
      const matrix = buildPreviewMatrix(
        [
          [0, 0],
          [3, 1],
        ],
        2,
        3
      );

      expect(matrix).toEqual([
        [0, 0, 0],
        [0, 0, 1],
      ]);
    });

    it('centres blocks within the preview matrix', () => {
      const matrix = buildPreviewMatrix(
        [
          [0, 0],
          [1, 0],
          [1, 1],
        ],
        4,
        4
      );

      expect(matrix).toEqual([
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
      ]);
    });

    it('returns an empty preview when coordinates cannot be determined', () => {
      const matrix = buildPreviewMatrix(
        [
          [Number.NaN, 0],
          [0, Number.POSITIVE_INFINITY],
        ],
        3,
        3
      );

      expect(matrix).toEqual([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
      ]);
    });
  });

  describe('createPreviewData', () => {
    it('builds preview data from a valid piece', () => {
      const piece = {
        shape: [
          [1, 1],
          [0, 1],
        ],
        color: 3,
        position: { x: 2, y: 5 },
      };

      const preview = createPreviewData(piece);

      expect(preview.matrix).toHaveLength(DEFAULT_PREVIEW_ROWS);
      expect(preview.matrix[0]).toHaveLength(DEFAULT_PREVIEW_COLS);
      expect(preview.piece.position).toEqual({ x: 2, y: 5 });
      expect(preview.color).toBe(BASE_TETRIS_COLORS[3]);
    });

    it('falls back to palette defaults when colour is missing', () => {
      const preview = createPreviewData({ shape: [[1]] });
      expect(preview.color).toBe(BASE_TETRIS_COLORS.default);
    });

    it('retains custom colours when not present in the palette', () => {
      const preview = createPreviewData({
        shape: [[1]],
        color: '#123abc',
      });

      expect(preview.color).toBe('#123abc');
    });

    it('falls back to the provided colour when normalisation fails', () => {
      const preview = createPreviewData({
        color: '#00ffee',
      });

      expect(preview.color).toBe('#00ffee');
    });

    it('handles pieces that cannot be normalised', () => {
      const preview = createPreviewData(null);
      expect(preview.matrix).toEqual(
        Array.from({ length: DEFAULT_PREVIEW_ROWS }, () =>
          Array(DEFAULT_PREVIEW_COLS).fill(0)
        )
      );
      expect(preview.piece).toBeNull();
      expect(preview.color).toBe(BASE_TETRIS_COLORS[1]);
    });

    it('derives colours via the palette when only a colour is specified', () => {
      const preview = createPreviewData({ color: 2 });
      expect(preview.color).toBe(BASE_TETRIS_COLORS[2]);
    });
  });

  describe('createPreviewData colour fallbacks', () => {
    afterEach(() => {
      vi.unmock('@/utils/tetris.js');
    });

    it('uses palette default when the fallback key is unavailable', async () => {
      vi.resetModules();
      vi.doMock('@/utils/tetris.js', () => ({
        BASE_TETRIS_COLORS: Object.freeze({ default: '#abcdef' }),
        normalizeActivePiece: vi.fn(() => null),
      }));

      const { createPreviewData: mockedCreatePreviewData } = await import(
        '../tetrisPreview.js'
      );

      expect(mockedCreatePreviewData({}).color).toBe('#abcdef');
      vi.resetModules();
    });

    it('defaults to a transparent colour when the palette is empty', async () => {
      vi.resetModules();
      vi.doMock('@/utils/tetris.js', () => ({
        BASE_TETRIS_COLORS: Object.freeze({}),
        normalizeActivePiece: vi.fn(() => null),
      }));

      const { createPreviewData: mockedCreatePreviewData } = await import(
        '../tetrisPreview.js'
      );

      expect(mockedCreatePreviewData({}).color).toBe('rgba(0,0,0,0)');
      vi.resetModules();
    });
  });
});
