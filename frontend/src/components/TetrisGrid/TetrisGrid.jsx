import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BASE_TETRIS_COLORS,
  CELL_SIZE,
  DEFAULT_BOARD_COLS,
  DEFAULT_BOARD_ROWS,
  normalizeGrid,
  normalizeActivePiece,
} from '@/utils/tetris.js';
import {
  Board,
  Cell,
  Overlay,
  OverlayInner,
  Block,
} from './TetrisGrid.styles.js';

const renderOverlay = (piece) => {
  if (!piece || piece.blocks.length === 0) return null;

  return (
    <Overlay aria-hidden>
      <OverlayInner
        style={{
          transform: `translate3d(${piece.position.x * CELL_SIZE}px, ${piece.position.y * CELL_SIZE}px, 0)`,
        }}
      >
        {piece.blocks.map(([bx, by]) => (
          <Block
            key={`${bx}-${by}`}
            $size={CELL_SIZE}
            style={{
              left: bx * CELL_SIZE,
              top: by * CELL_SIZE,
              '--block-color': piece.color,
              '--block-shadow': piece.shadowColor,
            }}
          />
        ))}
      </OverlayInner>
    </Overlay>
  );
};

const TetrisGrid = ({
  grid,
  showGrid = false,
  currentPiece,
  rows = DEFAULT_BOARD_ROWS,
  cols = DEFAULT_BOARD_COLS,
  cellSize = CELL_SIZE,
}) => {
  const normalizedGrid = useMemo(
    () => normalizeGrid(grid, rows, cols, BASE_TETRIS_COLORS),
    [grid, rows, cols]
  );

  const normalizedCurrentPiece = useMemo(
    () => normalizeActivePiece(currentPiece, BASE_TETRIS_COLORS),
    [currentPiece]
  );

  const overlay = useMemo(
    () => renderOverlay(normalizedCurrentPiece),
    [normalizedCurrentPiece]
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
      {overlay}
    </Board>
  );
};

TetrisGrid.propTypes = {
  rows: PropTypes.number,
  cols: PropTypes.number,
  grid: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)),
  showGrid: PropTypes.bool,
  currentPiece: PropTypes.shape({
    shape: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    color: PropTypes.string,
    position: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
    type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  cellSize: PropTypes.number,
};

export default TetrisGrid;
