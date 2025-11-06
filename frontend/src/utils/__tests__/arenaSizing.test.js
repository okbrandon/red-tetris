import {
  deriveCardScale,
  estimateOpponentCellSize,
  derivePreviewCellSize,
  computePrimaryCellSize,
} from '../arenaSizing.js';
import { CELL_SIZE } from '../tetris.js';

const originalInnerWidth = window.innerWidth;
const originalInnerHeight = window.innerHeight;

const setWindowSize = (width, height) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: height,
  });
};

describe('arenaSizing utilities', () => {
  beforeEach(() => {
    setWindowSize(1280, 800);
  });

  afterAll(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: originalInnerHeight,
    });
  });

  describe('deriveCardScale', () => {
    it('scales sensibly based on player counts', () => {
      expect(deriveCardScale(1)).toBe(1);
      expect(deriveCardScale(2)).toBe(0.95);
      expect(deriveCardScale(3)).toBe(0.9);
      expect(deriveCardScale(6)).toBeCloseTo(0.765, 3);
      expect(deriveCardScale(40)).toBe(0.6);
    });
  });

  describe('estimateOpponentCellSize', () => {
    it('produces a bounded value when opponents are absent', () => {
      const preferred = Math.max(10, Math.floor(CELL_SIZE * 0.45));
      const minimum = Math.max(4, Math.floor(CELL_SIZE * 0.18));
      const maximum = Math.max(preferred, Math.floor(CELL_SIZE * 0.55));

      const result = estimateOpponentCellSize(0);

      expect(result).toBeGreaterThanOrEqual(minimum);
      expect(result).toBeLessThanOrEqual(maximum);
    });

    it('respects browser dimensions when computing card sizing', () => {
      setWindowSize(960, 720);
      const result = estimateOpponentCellSize(2);

      const preferred = Math.max(10, Math.floor(CELL_SIZE * 0.45));
      const minimum = Math.max(4, Math.floor(CELL_SIZE * 0.18));
      const maximum = Math.max(preferred, Math.floor(CELL_SIZE * 0.55));

      expect(result).toBeGreaterThanOrEqual(minimum);
      expect(result).toBeLessThanOrEqual(maximum);
    });

    it('applies small viewport adjustments for single opponents', () => {
      setWindowSize(720, 680);
      const result = estimateOpponentCellSize(1);

      const minimum = Math.max(4, Math.floor(CELL_SIZE * 0.18));
      const soloCap = Math.max(minimum, Math.floor(CELL_SIZE * 0.42));

      expect(result).toBeGreaterThanOrEqual(minimum);
      expect(result).toBeLessThanOrEqual(soloCap);
    });

    it('falls back to the preferred size when ratios are not finite', () => {
      setWindowSize(1280, Number.POSITIVE_INFINITY);
      const result = estimateOpponentCellSize(3);

      const preferred = Math.max(10, Math.floor(CELL_SIZE * 0.45));
      const minimum = Math.max(4, Math.floor(CELL_SIZE * 0.18));
      const maximum = Math.max(preferred, Math.floor(CELL_SIZE * 0.55));

      expect(result).toBe(Math.max(minimum, Math.min(preferred, maximum)));
    });

    it('uses the minimum size when the available height is too small', () => {
      setWindowSize(900, 420);
      const result = estimateOpponentCellSize(6);

      const minimum = Math.max(4, Math.floor(CELL_SIZE * 0.18));
      expect(result).toBe(minimum);
    });

    it('caps the size using tier limits when candidates are large', () => {
      setWindowSize(2200, 1600);
      const result = estimateOpponentCellSize(1);

      const minimum = Math.max(4, Math.floor(CELL_SIZE * 0.18));
      const soloCap = Math.max(minimum, Math.floor(CELL_SIZE * 0.42));

      expect(result).toBe(soloCap);
    });

    it('falls back gracefully when window is undefined', () => {
      const realWindow = globalThis.window;
      vi.stubGlobal('window', undefined);

      const result = estimateOpponentCellSize(3);

      vi.unstubAllGlobals();
      globalThis.window = realWindow;

      const preferred = Math.max(10, Math.floor(CELL_SIZE * 0.45));
      const minimum = Math.max(4, Math.floor(CELL_SIZE * 0.18));
      const maximum = Math.max(preferred, Math.floor(CELL_SIZE * 0.55));

      expect(result).toBeGreaterThanOrEqual(minimum);
      expect(result).toBeLessThanOrEqual(maximum);
    });
  });

  describe('derivePreviewCellSize', () => {
    it('derives a preview size constrained by preview bounds', () => {
      const size = derivePreviewCellSize({
        opponentCount: 3,
        rows: 4,
        cols: 4,
      });

      expect(size).toBeGreaterThanOrEqual(3);
      expect(size).toBeLessThanOrEqual(20);
    });

    it('enforces a minimum preview size even with tiny bounds', () => {
      const size = derivePreviewCellSize({
        opponentCount: 3,
        rows: 200,
        cols: 200,
      });
      expect(size).toBe(3);
    });

    it('normalises invalid row and column values before sizing', () => {
      const size = derivePreviewCellSize({
        opponentCount: 0,
        rows: -10,
        cols: 0,
      });

      expect(size).toBeGreaterThanOrEqual(3);
    });
  });

  describe('computePrimaryCellSize', () => {
    it('computes a responsive size within the allowed range', () => {
      setWindowSize(1400, 900);
      const result = computePrimaryCellSize();
      expect(result).toBeGreaterThanOrEqual(20);
      expect(result).toBeLessThanOrEqual(42);
    });

    it('handles narrow viewports without sidebar adjustments', () => {
      setWindowSize(760, 640);
      const result = computePrimaryCellSize();

      expect(result).toBeGreaterThanOrEqual(20);
      expect(result).toBeLessThanOrEqual(42);
    });

    it('returns the default when no window is available', () => {
      const realWindow = globalThis.window;
      vi.stubGlobal('window', undefined);
      const fallback = computePrimaryCellSize();
      vi.unstubAllGlobals();
      globalThis.window = realWindow;

      expect(fallback).toBe(32);
    });
  });
});
