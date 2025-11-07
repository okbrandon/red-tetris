import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import React from 'react';

function wrapWithTestId(Component, testId) {
  const Wrapped = React.forwardRef((props, ref) =>
    React.createElement(Component, { ref, 'data-testid': testId, ...props })
  );
  Wrapped.displayName = `WithTestId(${testId})`;
  return Wrapped;
}

vi.mock('./AnimatedBackground.styles.js', async () => {
  const actual = await vi.importActual('./AnimatedBackground.styles.js');

  return {
    __esModule: true,
    ...actual,
    Background: wrapWithTestId(actual.Background, 'animated-background'),
    Grid: wrapWithTestId(actual.Grid, 'animated-grid'),
    Pieces: wrapWithTestId(actual.Pieces, 'animated-pieces'),
    Piece: wrapWithTestId(actual.Piece, 'animated-piece'),
    Tile: wrapWithTestId(actual.Tile, 'animated-tile'),
  };
});

beforeAll(async () => {
  await vi.importActual('./AnimatedBackground.styles.js');
});

import AnimatedBackground, {
  getShapeCoordinates,
} from './AnimatedBackground.jsx';

const getCssVariable = (element, name) => element.style.getPropertyValue(name);

describe('AnimatedBackground', () => {
  it('renders all decorative pieces with expected styling metadata', () => {
    const { container } = render(<AnimatedBackground />);

    expect(screen.getByTestId('animated-background')).toBeInTheDocument();
    expect(screen.getByTestId('animated-grid')).toBeInTheDocument();

    const pieces = screen.getAllByTestId('animated-piece');
    expect(pieces).toHaveLength(10);

    const firstPiece = pieces[0];
    expect(firstPiece.style.width).toBe('56px');
    expect(firstPiece.style.height).toBe('14px');
    expect(getCssVariable(firstPiece, '--x')).toBe('-48vw');
    expect(getCssVariable(firstPiece, '--dur')).toBe('26s');

    const firstPieceTiles = firstPiece.querySelectorAll(
      '[data-testid="animated-tile"]'
    );
    expect(firstPieceTiles).toHaveLength(4);
    expect(firstPieceTiles[0].style.left).toBe('0px');
    expect(firstPieceTiles[1].style.left).toBe('14px');

    const farRightPiece = pieces.find(
      (element) => getCssVariable(element, '--x') === '46vw'
    );
    expect(farRightPiece).toBeDefined();
    expect(getCssVariable(farRightPiece, '--scale')).toBe('0.85');

    const totalTiles = container.querySelectorAll(
      '[data-testid="animated-tile"]'
    ).length;
    expect(totalTiles).toBeGreaterThan(0);
  });

  it('falls back to the default square when a shape definition is missing', () => {
    const fallback = getShapeCoordinates('unknown-shape');
    expect(fallback).toEqual([
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]);
  });
});
