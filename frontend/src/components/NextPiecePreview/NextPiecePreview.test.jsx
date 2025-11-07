/* eslint-disable react/prop-types */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

function wrapWithAttributes(Component, testId) {
  const Wrapped = React.forwardRef((props, ref) => {
    const { $filled, $size, $color, ...rest } = props;
    return (
      <Component
        ref={ref}
        data-testid={testId}
        data-filled={$filled ? 'true' : 'false'}
        data-size={$size}
        data-color={$color ?? ''}
        $filled={$filled}
        $size={$size}
        $color={$color}
        {...rest}
      />
    );
  });
  Wrapped.displayName = `TestWrapped(${testId})`;
  return Wrapped;
}

vi.mock('./NextPiecePreview.styles.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {
    __esModule: true,
    ...actual,
    Board: wrapWithAttributes(actual.Board, 'preview-board'),
    Cell: wrapWithAttributes(actual.Cell, 'preview-cell'),
  };
});

import NextPiecePreview from './NextPiecePreview.jsx';

describe('NextPiecePreview', () => {
  it('renders a centered preview for the provided piece', () => {
    const piece = {
      color: 'purple',
      shape: [
        [0, 1, 0],
        [1, 1, 1],
      ],
    };

    render(<NextPiecePreview piece={piece} cellSize={20} />);

    const cells = screen.getAllByTestId('preview-cell');
    expect(cells).toHaveLength(16);

    const filled = cells.filter((cell) => cell.dataset.filled === 'true');
    expect(filled).toHaveLength(4);
    expect(filled.every((cell) => cell.dataset.size === '20')).toBe(true);
    expect(filled.every((cell) => cell.dataset.color === 'rgba(191,90,242,1)')).toBe(
      true
    );

    const styles = filled.map((cell) => window.getComputedStyle(cell));
    expect(styles.every((style) => style.backgroundImage.includes('linear-gradient'))).toBe(
      true
    );
    expect(styles.every((style) => style.borderRadius !== '0px')).toBe(true);
  });

  it('falls back to an empty preview when no piece is provided', () => {
    render(<NextPiecePreview piece={null} />);

    const cells = screen.getAllByTestId('preview-cell');
    expect(cells).toHaveLength(16);
    expect(cells.every((cell) => cell.dataset.filled === 'false')).toBe(true);
    expect(
      cells.some((cell) => cell.dataset.color === 'rgba(0,229,255,1)')
    ).toBe(true);

    const styles = cells.map((cell) => window.getComputedStyle(cell));
    expect(
      styles.every((style) => !style.backgroundImage.includes('linear-gradient'))
    ).toBe(true);
  });
});
