import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { palette, normalizeGridMock } = vi.hoisted(() => ({
  palette: { default: 'rgba(10,10,10,1)' },
  normalizeGridMock: vi.fn(),
}));

vi.mock('@/utils/tetris.js', () => ({
  __esModule: true,
  BASE_TETRIS_COLORS: palette,
  CELL_SIZE: 30,
  DEFAULT_BOARD_COLS: 10,
  DEFAULT_BOARD_ROWS: 20,
  normalizeGrid: (...args) => normalizeGridMock(...args),
}));

import { BASE_TETRIS_COLORS } from '@/utils/tetris.js';
import TetrisGrid from './TetrisGrid.jsx';

describe('TetrisGrid', () => {
  beforeEach(() => {
    normalizeGridMock.mockReset();
  });

  it('normalizes the provided grid and renders each cell with grid lines', () => {
    const gridInput = [[{ raw: true }]];
    const normalized = [
      [
        {
          filled: true,
          ghost: false,
          indestructible: false,
          color: 'rgba(255,0,0,1)',
          shadowColor: 'rgba(0,0,0,0.4)',
        },
        {
          filled: false,
          ghost: true,
          indestructible: false,
          color: 'rgba(0,255,0,1)',
          shadowColor: 'rgba(0,0,0,0.2)',
        },
        {
          filled: false,
          ghost: false,
          indestructible: true,
          color: 'rgba(0,0,255,1)',
          shadowColor: 'rgba(0,0,0,0.6)',
        },
      ],
    ];
    normalizeGridMock.mockReturnValue(normalized);

    render(
      <TetrisGrid
        grid={gridInput}
        rows={1}
        cols={3}
        cellSize={22}
        showGrid
      />
    );

    expect(normalizeGridMock).toHaveBeenCalledWith(
      gridInput,
      1,
      3,
      BASE_TETRIS_COLORS
    );

    const board = screen.getByRole('grid');
    expect(board.style.gridTemplateColumns).toBe('repeat(3, 22px)');
    expect(board.style.gridTemplateRows).toBe('repeat(1, 22px)');

    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(3);
    expect(cells[0].getAttribute('data-filled')).toBe('true');
    expect(cells[0].getAttribute('data-ghost')).toBe('false');
    expect(cells[0].style.getPropertyValue('--cell-color')).toBe(
      'rgba(255,0,0,1)'
    );
    expect(cells[0].style.getPropertyValue('--cell-shadow')).toBe(
      'rgba(0,0,0,0.4)'
    );

    expect(cells[1].getAttribute('data-filled')).toBe('false');
    expect(cells[1].getAttribute('data-ghost')).toBe('true');
    expect(cells[1].getAttribute('data-indestructible')).toBe('false');

    expect(cells[2].getAttribute('data-filled')).toBe('false');
    expect(cells[2].getAttribute('data-ghost')).toBe('false');
    expect(cells[2].getAttribute('data-indestructible')).toBe('true');
  });

  it('uses default dimensions when optional props are omitted', () => {
    const normalized = Array.from({ length: 20 }, () =>
      Array.from({ length: 10 }, () => ({
        filled: false,
        ghost: false,
        indestructible: false,
        color: 'rgba(120,120,120,1)',
        shadowColor: 'rgba(0,0,0,0.2)',
      }))
    );
    normalizeGridMock.mockReturnValue(normalized);

    render(<TetrisGrid grid={undefined} />);

    expect(normalizeGridMock).toHaveBeenCalledWith(
      undefined,
      20,
      10,
      BASE_TETRIS_COLORS
    );

    const board = screen.getByRole('grid');
    expect(board.style.gridTemplateColumns).toBe('repeat(10, 30px)');
    expect(board.style.gridTemplateRows).toBe('repeat(20, 30px)');
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(200);
    expect(cells[0].getAttribute('data-filled')).toBe('false');
  });
});
