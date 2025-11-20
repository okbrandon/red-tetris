import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  LockedPieceCell,
  LockedPieceLayer,
} from './TetrisGrid.styles.js';

const MAX_SMOOTH_DELTA = 1;
const SHAKE_DURATION_MS = 260;
const HIGHLIGHT_DURATION_MS = 680;

const snapshotGrid = (grid) =>
  grid?.map((row) =>
    row.map((cell) => ({
      filled: Boolean(cell?.filled),
      ghost: Boolean(cell?.ghost),
    }))
  ) ?? null;

const detectNewlyFilledCells = (previousSnapshot, currentGrid) => {
  if (!previousSnapshot) return [];
  const cells = [];
  for (let y = 0; y < currentGrid.length; y += 1) {
    const currentRow = currentGrid[y];
    const prevRow = previousSnapshot[y] ?? [];
    if (!Array.isArray(currentRow)) continue;

    for (let x = 0; x < currentRow.length; x += 1) {
      const currentCell = currentRow[x];
      if (!currentCell) continue;
      const prevCell = prevRow[x];
      const wasFilled = Boolean(prevCell?.filled);
      const isFilled = Boolean(currentCell.filled) && !currentCell.ghost;
      if (isFilled && !wasFilled) {
        cells.push({ x, y });
      }
    }
  }
  return cells;
};

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

  const boardRef = useRef(null);
  const shakeTimeoutRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  const previousGridSnapshotRef = useRef(null);

  const triggerBoardImpact = useCallback(() => {
    const boardElement = boardRef.current;
    if (!boardElement) return;

    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
      shakeTimeoutRef.current = null;
    }

    boardElement.removeAttribute('data-shake');
    void boardElement.offsetWidth;

    boardElement.setAttribute('data-shake', 'true');

    shakeTimeoutRef.current = setTimeout(() => {
      if (!('isConnected' in boardElement) || boardElement.isConnected) {
        boardElement.removeAttribute('data-shake');
      }
      shakeTimeoutRef.current = null;
    }, SHAKE_DURATION_MS);
  }, []);

  const [lockedHighlight, setLockedHighlight] = useState(null);

  const triggerLockedPieceHighlight = useCallback(
    (pieceSnapshot, overrideCells = null) => {
      if (!pieceSnapshot) return;
      const { blocks, position, color, shadowColor, signature } = pieceSnapshot;
      if (!position) return;

      const baseCells = Array.isArray(blocks)
        ? blocks.map(([blockX, blockY]) => ({
            x: position.x + blockX,
            y: position.y + blockY,
          }))
        : [];

      const resolvedCells =
        Array.isArray(overrideCells) && overrideCells.length
          ? overrideCells
          : baseCells;

      const cells = resolvedCells.filter(
        ({ x, y }) =>
          Number.isInteger(x) &&
          Number.isInteger(y) &&
          x >= 0 &&
          x < cols &&
          y >= 0 &&
          y < rows
      );

      if (!cells.length) return;

      setLockedHighlight({
        cells,
        color: color ?? BASE_TETRIS_COLORS.default,
        shadowColor: shadowColor ?? 'rgba(255,255,255,0.65)',
        signature: signature ?? `locked-${Date.now()}`,
      });

      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }

      highlightTimeoutRef.current = setTimeout(() => {
        setLockedHighlight(null);
        highlightTimeoutRef.current = null;
      }, HIGHLIGHT_DURATION_MS);
    },
    [cols, rows]
  );

  useEffect(
    () => () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
        shakeTimeoutRef.current = null;
      }
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = null;
      }
    },
    []
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
    const previousGridSnapshot = previousGridSnapshotRef.current;

    if (previous && previous.signature !== null && signature !== null) {
      const isDifferentSignature = previous.signature !== signature;
      if (isDifferentSignature) {
        const newlyLockedCells = detectNewlyFilledCells(
          previousGridSnapshot,
          normalizedGrid
        );

        if (newlyLockedCells.length > 0) {
          triggerLockedPieceHighlight(previous, newlyLockedCells);
          triggerBoardImpact();
        }

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
      blocks: activePiece.blocks?.map(([x, y]) => [x, y]) ?? [],
      color: activePiece.color,
      shadowColor: activePiece.shadowColor,
      signature,
    };
  }, [
    activePiece,
    currentPiece,
    normalizedGrid,
    triggerBoardImpact,
    triggerLockedPieceHighlight,
  ]);

  useEffect(() => {
    previousGridSnapshotRef.current = snapshotGrid(normalizedGrid);
  }, [normalizedGrid]);

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
      ref={boardRef}
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
      {lockedHighlight ? (
        <LockedPieceLayer data-testid="locked-piece-highlight">
          {lockedHighlight.cells.map(({ x, y }) => (
            <LockedPieceCell
              key={`${lockedHighlight.signature}-${x}-${y}`}
              data-highlight-cell="true"
              $size={cellSize}
              style={{
                '--locked-x': `${x * cellSize}px`,
                '--locked-y': `${y * cellSize}px`,
                '--locked-color': lockedHighlight.color,
                '--locked-shadow': lockedHighlight.shadowColor,
              }}
            />
          ))}
        </LockedPieceLayer>
      ) : null}
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
