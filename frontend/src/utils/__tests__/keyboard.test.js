import {
  extractMoveDirection,
  shouldIgnoreForGameControls,
} from '../keyboard.js';

describe('keyboard utilities', () => {
  describe('shouldIgnoreForGameControls', () => {
    it('returns true for common text inputs', () => {
      const input = document.createElement('input');
      const textarea = document.createElement('textarea');
      const select = document.createElement('select');

      expect(shouldIgnoreForGameControls(input)).toBe(true);
      expect(shouldIgnoreForGameControls(textarea)).toBe(true);
      expect(shouldIgnoreForGameControls(select)).toBe(true);
    });

    it('returns true for content editable elements', () => {
      const div = document.createElement('div');
      Object.defineProperty(div, 'isContentEditable', {
        configurable: true,
        get: () => true,
      });

      expect(shouldIgnoreForGameControls(div)).toBe(true);
    });

    it('returns false for other elements or missing targets', () => {
      const button = document.createElement('button');

      expect(shouldIgnoreForGameControls(button)).toBe(false);
      expect(shouldIgnoreForGameControls(null)).toBe(false);
      expect(shouldIgnoreForGameControls({})).toBe(false);
    });
  });

  describe('extractMoveDirection', () => {
    it('maps arrow keys to directions', () => {
      expect(extractMoveDirection({ key: 'ArrowLeft' })).toBe('left');
      expect(extractMoveDirection({ key: 'ArrowRight' })).toBe('right');
      expect(extractMoveDirection({ key: 'ArrowDown' })).toBe('down');
      expect(extractMoveDirection({ key: 'ArrowUp' })).toBe('up');
    });

    it('normalises space variants', () => {
      expect(extractMoveDirection({ code: 'Space' })).toBe('space');
      expect(extractMoveDirection({ key: ' ' })).toBe('space');
      expect(extractMoveDirection({ key: 'Spacebar' })).toBe('space');
    });

    it('returns null for unsupported events', () => {
      expect(extractMoveDirection({ key: 'a' })).toBeNull();
      expect(extractMoveDirection(null)).toBeNull();
    });
  });
});
