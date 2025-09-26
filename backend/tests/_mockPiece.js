import { jest } from '@jest/globals';
import Piece from '../piece.js';

export function createMockPiece({ shape = [[1]], color = 'red', position = { x: 0, y: 0 } } = {}) {
  const piece = new Piece(shape, color, position);
  piece.clone = jest.fn(() => new Piece(shape.map(row => [...row]), color, { ...position }));
  piece.rotate = jest.fn(() => shape);
  piece.getLeadingEmptyRows = jest.fn(() => 0);
  return piece;
}
