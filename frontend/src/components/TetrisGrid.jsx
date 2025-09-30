import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { BASE_TETRIS_COLORS, extractPieceBlocks } from '../utils/tetris.js';
import { Board, Cell, Overlay, OverlayInner, Block } from './TetrisGrid.styled.js';

const setAlpha = (color, alpha) => {
    if (!color) return `rgba(0,0,0,${alpha})`;
    const trimmed = color.trim();

    if (trimmed.startsWith('rgba')) {
        const body = trimmed.slice(5, -1).split(',').map((part) => part.trim());
        if (body.length >= 3) {
            return `rgba(${body[0]}, ${body[1]}, ${body[2]}, ${alpha})`;
        }
    }

    if (trimmed.startsWith('rgb(')) {
        const body = trimmed.slice(4, -1).split(',').map((part) => part.trim());
        if (body.length === 3) {
            return `rgba(${body.join(', ')}, ${alpha})`;
        }
    }

    if (trimmed.startsWith('#')) {
        let hex = trimmed.slice(1);
        if (hex.length === 3) {
            hex = hex.split('').map((c) => c + c).join('');
        }
        if (hex.length === 6) {
            const value = Number.parseInt(hex, 16);
            const r = (value >> 16) & 255;
            const g = (value >> 8) & 255;
            const b = value & 255;
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    }

    return color;
};

const normalizeCell = (value, palette) => {
    const filled = Boolean(value.filled);
    const ghost = Boolean(value.ghost);
    const indestructible = Boolean(value.indestructible);
    const baseColor = palette[value.color];
    const color = ghost
        ? palette.ghost
        : indestructible
            ? palette.indestructible
            : baseColor;
    const shadowColor = ghost
            ? setAlpha(color, 0.25)
            : setAlpha(color, filled ? 0.45 : 0.12);

    return {
        filled: ghost ? false : filled,
        ghost,
        indestructible,
        color,
        shadowColor,
    };
};

const normalizeGrid = (grid, rows, cols, palette) => {
    const normalized = [];
    for (let y = 0; y < rows; y += 1) {
        const row = [];
        for (let x = 0; x < cols; x += 1) {
            const value = Array.isArray(grid) && Array.isArray(grid[y]) ? grid[y][x] : undefined;
            row.push(normalizeCell(value, palette));
        }
        normalized.push(row);
    }
    return normalized;
};

const normalizeActivePiece = (piece, palette) => {
    if (!piece) return null;
    if (!Array.isArray(piece.shape)) return null;

    const blocks = extractPieceBlocks(piece, { preferShape: true });

    if (blocks.length === 0) return null;

    const color = palette[piece.color];

    return {
        blocks,
        position: piece.position ?? { x: 0, y: 0 },
        color,
        shadowColor: setAlpha(color, 0.45),
    };
};

const TetrisGrid = ({
    rows = 20,
    cols = 10,
    cellSize = 24,
    grid,
    showGrid = true,
    currentPiece,
}) => {
    const palette = useMemo(() => ({ ...BASE_TETRIS_COLORS }), []);
    const sourceGrid = useMemo(() => (Array.isArray(grid) ? grid : []), [grid]);

    const normalizedGrid = useMemo(
        () => normalizeGrid(sourceGrid, rows, cols, palette),
        [sourceGrid, rows, cols, palette]
    );

    const normalizedCurrentPiece = useMemo(
        () => normalizeActivePiece(currentPiece, palette),
        [currentPiece, palette]
    );

    const overlay = normalizedCurrentPiece && normalizedCurrentPiece.blocks.length > 0 ? (
        <Overlay aria-hidden>
            <OverlayInner
                style={{
                    transform: `translate3d(${normalizedCurrentPiece.position.x * cellSize}px, ${normalizedCurrentPiece.position.y * cellSize}px, 0)`,
                }}
            >
                {normalizedCurrentPiece.blocks.map(([bx, by], index) => (
                    <Block
                        key={index}
                        $size={cellSize}
                        style={{
                            left: bx * cellSize,
                            top: by * cellSize,
                            '--block-color': normalizedCurrentPiece.color,
                            '--block-shadow': normalizedCurrentPiece.shadowColor,
                        }}
                    />
                ))}
            </OverlayInner>
        </Overlay>
    ) : null;

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
    cellSize: PropTypes.number,
    grid: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)),
    showGrid: PropTypes.bool,
    colors: PropTypes.object,
    currentPiece: PropTypes.shape({
        shape: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
        color: PropTypes.string,
        position: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
        type: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
};

export default TetrisGrid;
