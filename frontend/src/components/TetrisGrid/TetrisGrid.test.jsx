import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { palette, normalizeGridMock, normalizeActivePieceMock, setAlphaMock } =
  vi.hoisted(() => ({
    palette: {
      default: 'rgba(10,10,10,1)',
      empty: 'rgba(20,20,25,0.35)',
    },
    normalizeGridMock: vi.fn(),
    normalizeActivePieceMock: vi.fn(),
    setAlphaMock: vi.fn(),
  }));

vi.mock('@/utils/tetris.js', () => ({
  __esModule: true,
  BASE_TETRIS_COLORS: palette,
  CELL_SIZE: 30,
  DEFAULT_BOARD_COLS: 10,
  DEFAULT_BOARD_ROWS: 20,
  normalizeGrid: (...args) => normalizeGridMock(...args),
  normalizeActivePiece: (...args) => normalizeActivePieceMock(...args),
  setAlpha: (...args) => setAlphaMock(...args),
}));

import { BASE_TETRIS_COLORS } from '@/utils/tetris.js';
import TetrisGrid from './TetrisGrid.jsx';

describe('TetrisGrid', () => {
  beforeEach(() => {
    normalizeGridMock.mockReset();
    normalizeActivePieceMock.mockReset();
    setAlphaMock.mockReset();
    normalizeActivePieceMock.mockReturnValue(null);
    setAlphaMock.mockImplementation((color, alpha) => `${color}:${alpha}`);
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
      <TetrisGrid grid={gridInput} rows={1} cols={3} cellSize={22} showGrid />
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
    expect(board.style.width).toBe('66px');
    expect(board.style.height).toBe('22px');
    expect(screen.queryByTestId('active-piece-layer')).toBeNull();

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
    expect(board.style.width).toBe('300px');
    expect(board.style.height).toBe('600px');
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(200);
    expect(cells[0].getAttribute('data-filled')).toBe('false');
  });

  it('renders the active piece overlay and animates small movements only', () => {
    const gridInput = [[{ raw: true }, { raw: true }, { raw: true }]];
    const normalized = [
      [
        {
          filled: false,
          ghost: false,
          indestructible: false,
          color: 'rgba(10,10,10,1)',
          shadowColor: 'rgba(0,0,0,0.1)',
        },
        {
          filled: true,
          ghost: false,
          indestructible: false,
          color: 'rgba(50,50,50,1)',
          shadowColor: 'rgba(0,0,0,0.2)',
        },
        {
          filled: false,
          ghost: false,
          indestructible: false,
          color: 'rgba(90,90,90,1)',
          shadowColor: 'rgba(0,0,0,0.3)',
        },
      ],
    ];
    normalizeGridMock.mockReturnValue(normalized);

    normalizeActivePieceMock.mockImplementation((piece) => {
      if (!piece) return null;
      return {
        blocks: [[0, 0]],
        position: piece.position ?? { x: 0, y: 0 },
        color: '#abc',
        shadowColor: '#def',
      };
    });
    setAlphaMock.mockImplementation(() => 'rgba-empty');

    const { rerender } = render(
      <TetrisGrid
        grid={gridInput}
        rows={1}
        cols={3}
        cellSize={30}
        currentPiece={{ type: 'test', position: { x: 1, y: 0 } }}
      />
    );

    const layer = screen.getByTestId('active-piece-layer');
    expect(layer.dataset.animate).toBe('false');
    expect(layer.style.transform).toBe('translate3d(30px, 0px, 0)');
    expect(layer.querySelectorAll('[data-piece-cell="true"]').length).toBe(1);

    const cells = screen.getAllByRole('gridcell');
    expect(cells[1].getAttribute('data-filled')).toBe('false');
    expect(cells[1].style.getPropertyValue('--cell-color')).toBe(
      BASE_TETRIS_COLORS.empty
    );
    expect(setAlphaMock).toHaveBeenCalledWith(BASE_TETRIS_COLORS.empty, 0.12);

    rerender(
      <TetrisGrid
        grid={gridInput}
        rows={1}
        cols={3}
        cellSize={30}
        currentPiece={{ type: 'test', position: { x: 2, y: 0 } }}
      />
    );

    const animatedLayer = screen.getByTestId('active-piece-layer');
    expect(animatedLayer.dataset.animate).toBe('true');
    expect(animatedLayer.style.transform).toBe('translate3d(60px, 0px, 0)');

    rerender(
      <TetrisGrid
        grid={gridInput}
        rows={1}
        cols={3}
        cellSize={30}
        currentPiece={{ type: 'test', position: { x: 2, y: 3 } }}
      />
    );

    const jumpLayer = screen.getByTestId('active-piece-layer');
    expect(jumpLayer.dataset.animate).toBe('false');
    expect(jumpLayer.style.transform).toBe('translate3d(60px, 90px, 0)');
  });
});
