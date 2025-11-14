import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  BASE_TETRIS_COLORS,
  CELL_SIZE,
  DEFAULT_BOARD_COLS,
  DEFAULT_BOARD_ROWS,
  normalizeGrid,
  normalizeActivePiece,
  setAlpha,
} from '@/utils/tetris.js';
import {
  ActivePieceCell,
  ActivePieceLayer,
  Board,
  Cell,
} from './TetrisGrid.styles.js';

const MAX_SMOOTH_DELTA = 1;

const getPieceSignature = (piece) => {
  if (!piece || typeof piece !== 'object') return null;
  if (piece.id !== undefined) return piece.id;
  if (piece.uuid !== undefined) return piece.uuid;
  if (typeof piece.name === 'string' && piece.name.trim())
    return piece.name.trim();
  if (typeof piece.type === 'string' && piece.type.trim())
    return piece.type.trim();
  if (typeof piece.color === 'string' && piece.color.trim())
    return `color:${piece.color.trim()}`;
  return null;
};

const TetrisGrid = ({
  grid,
  currentPiece = null,
  showGrid = false,
  rows = DEFAULT_BOARD_ROWS,
  cols = DEFAULT_BOARD_COLS,
  cellSize = CELL_SIZE,
}) => {
  const activePiece = useMemo(
    () => normalizeActivePiece(currentPiece, BASE_TETRIS_COLORS),
    [currentPiece]
  );

  const normalizedGrid = useMemo(() => {
    const base = normalizeGrid(grid, rows, cols, BASE_TETRIS_COLORS);
    if (!activePiece) return base;

    return base.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        const isActiveCell = activePiece.blocks?.some(([blockX, blockY]) => {
          const targetX = activePiece.position.x + blockX;
          const targetY = activePiece.position.y + blockY;
          return targetX === colIndex && targetY === rowIndex;
        });

        if (!isActiveCell || cell.indestructible || cell.ghost) return cell;

        const emptyColor = BASE_TETRIS_COLORS.empty ?? 'rgba(20,20,25,0.35)';
        return {
          ...cell,
          filled: false,
          color: emptyColor,
          shadowColor: setAlpha(emptyColor, 0.12),
        };
      })
    );
  }, [grid, rows, cols, activePiece]);

  const [shouldAnimate, setShouldAnimate] = useState(false);
  const previousPieceRef = useRef(null);

  useEffect(() => {
    if (!activePiece) {
      setShouldAnimate(false);
      previousPieceRef.current = null;
      return;
    }

    const signature = getPieceSignature(currentPiece);
    const previous = previousPieceRef.current;

    if (previous && previous.signature !== null && signature !== null) {
      const isDifferentSignature = previous.signature !== signature;
      if (isDifferentSignature) {
        setShouldAnimate(false);
      } else {
        const dx = activePiece.position.x - previous.position.x;
        const dy = activePiece.position.y - previous.position.y;
        const maxDelta = Math.max(Math.abs(dx), Math.abs(dy));
        const moved = dx !== 0 || dy !== 0;
        const sameBlockCount =
          (activePiece.blocks?.length ?? 0) === previous.blockCount;
        setShouldAnimate(
          moved && maxDelta <= MAX_SMOOTH_DELTA && sameBlockCount
        );
      }
    } else if (previous) {
      const dx = activePiece.position.x - previous.position.x;
      const dy = activePiece.position.y - previous.position.y;
      const maxDelta = Math.max(Math.abs(dx), Math.abs(dy));
      const moved = dx !== 0 || dy !== 0;
      const sameBlockCount =
        (activePiece.blocks?.length ?? 0) === previous.blockCount;
      setShouldAnimate(moved && maxDelta <= MAX_SMOOTH_DELTA && sameBlockCount);
    } else {
      setShouldAnimate(false);
    }

    previousPieceRef.current = {
      position: { ...activePiece.position },
      blockCount: activePiece.blocks?.length ?? 0,
      signature,
    };
  }, [activePiece, currentPiece]);

  const boardStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
      width: `${cols * cellSize}px`,
      height: `${rows * cellSize}px`,
    }),
    [cols, rows, cellSize]
  );

  const pieceTransform = activePiece
    ? `translate3d(${activePiece.position.x * cellSize}px, ${activePiece.position.y * cellSize}px, 0)`
    : 'translate3d(0px, 0px, 0)';

  return (
    <Board
      role="grid"
      aria-rowcount={rows}
      aria-colcount={cols}
      style={boardStyle}
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
      {activePiece ? (
        <ActivePieceLayer
          data-testid="active-piece-layer"
          data-animate={shouldAnimate ? 'true' : 'false'}
          $animate={shouldAnimate}
          style={{
            width: `${cols * cellSize}px`,
            height: `${rows * cellSize}px`,
            transform: pieceTransform,
          }}
        >
          {activePiece.blocks?.map(([blockX, blockY]) => (
            <ActivePieceCell
              key={`${blockX}-${blockY}`}
              data-piece-cell="true"
              $size={cellSize}
              style={{
                transform: `translate3d(${blockX * cellSize}px, ${blockY * cellSize}px, 0)`,
                '--piece-color': activePiece.color,
                '--piece-shadow': activePiece.shadowColor,
              }}
            />
          ))}
        </ActivePieceLayer>
      ) : null}
    </Board>
  );
};

TetrisGrid.propTypes = {
  rows: PropTypes.number,
  cols: PropTypes.number,
  grid: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)),
  currentPiece: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    uuid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    type: PropTypes.string,
    color: PropTypes.string,
    position: PropTypes.shape({
      x: PropTypes.number,
      y: PropTypes.number,
    }),
    shape: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  }),
  showGrid: PropTypes.bool,
  cellSize: PropTypes.number,
};

export default TetrisGrid;
