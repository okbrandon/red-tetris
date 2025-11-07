import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BASE_TETRIS_COLORS,
  CELL_SIZE,
  DEFAULT_BOARD_COLS,
  DEFAULT_BOARD_ROWS,
  normalizeGrid,
} from '@/utils/tetris.js';
import { Board, Cell } from './TetrisGrid.styles.js';

const TetrisGrid = ({
  grid,
  showGrid = false,
  rows = DEFAULT_BOARD_ROWS,
  cols = DEFAULT_BOARD_COLS,
  cellSize = CELL_SIZE,
}) => {
  const normalizedGrid = useMemo(
    () => normalizeGrid(grid, rows, cols, BASE_TETRIS_COLORS),
    [grid, rows, cols]
  );

  return (
    <Board
      role="grid"
      aria-rowcount={rows}
      aria-colcount={cols}
      style={{
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      }}
    >
      {normalizedGrid.map((row, y) =>
        row.map((cell, x) => (
          <Cell
            key={`${y}-${x}`}
            role="gridcell"
            data-testid="cell"
            data-filled={cell.filled ? 'true' : 'false'}
            data-ghost={cell.ghost ? 'true' : 'false'}
            data-indestructible={cell.indestructible ? 'true' : 'false'}
            $size={cellSize}
            $filled={cell.filled}
            $ghost={cell.ghost}
            $showGrid={showGrid}
            style={{
              '--cell-color': cell.color,
              '--cell-shadow': cell.shadowColor,
            }}
          />
        ))
      )}
    </Board>
  );
};

TetrisGrid.propTypes = {
  rows: PropTypes.number,
  cols: PropTypes.number,
  grid: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)),
  showGrid: PropTypes.bool,
  cellSize: PropTypes.number,
};

export default TetrisGrid;
