import { useMemo } from 'react';
import styled, { css, keyframes } from 'styled-components';
import PropTypes from 'prop-types';

const BASE_COLOR_PALETTE = Object.freeze({
    default: 'rgba(162,89,255,0.86)',
    empty: 'rgba(20,20,25,0.35)',
    ghost: 'rgba(208,204,255,0.18)',
    transparent: 'rgba(0,0,0,0)',
    indestructible: 'rgba(110,110,140,1)',
    1: 'rgba(0,229,255,1)', // I
    2: 'rgba(255,149,0,1)', // L
    3: 'rgba(0,122,255,1)', // J
    4: 'rgba(255,59,48,1)', // Z
    5: 'rgba(255,214,10,1)', // O
    6: 'rgba(191,90,242,1)', // T
    7: 'rgba(52,199,89,1)', // S
    cyan: 'rgba(0,229,255,1)',
    orange: 'rgba(255,149,0,1)',
    blue: 'rgba(0,122,255,1)',
    purple: 'rgba(191,90,242,1)',
    yellow: 'rgba(255,214,10,1)',
    green: 'rgba(52,199,89,1)',
    red: 'rgba(255,59,48,1)',
    gray: 'rgba(154,154,189,0.85)',
});

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

const resolveColor = (palette, value, fallback) => {
    const candidates = [value, fallback];

    for (const candidate of candidates) {
        if (candidate === undefined || candidate === null) continue;

        if (palette[candidate] !== undefined) return palette[candidate];

        if (typeof candidate === 'string') {
            const key = candidate.toLowerCase();
            if (palette[key] !== undefined) return palette[key];
            if (key === 'transparent') return palette.transparent;
            if (key === 'ghost') return palette.ghost;
            if (/^#|^rgb/.test(candidate)) return candidate;
        }

        if (typeof candidate === 'number') {
            if (palette[String(candidate)] !== undefined) return palette[String(candidate)];
            if (palette[candidate] !== undefined) return palette[candidate];
        }
    }

    return palette.default;
};

const createEmptyCell = (palette) => ({
    filled: false,
    ghost: false,
    indestructible: false,
    color: palette.empty,
    shadowColor: setAlpha(palette.default, 0.12),
});

const normalizeCell = (value, palette) => {
    if (value === undefined || value === null) {
        return createEmptyCell(palette);
    }

    if (typeof value === 'number') {
        if (value <= 0) return createEmptyCell(palette);
        const color = resolveColor(palette, value, value);
        return {
            filled: true,
            ghost: false,
            indestructible: false,
            color,
            shadowColor: setAlpha(color, 0.45),
        };
    }

    if (typeof value === 'string') {
        const color = resolveColor(palette, value, value);
        const isGhost = value.toLowerCase() === 'ghost';
        return {
            filled: !isGhost && color !== palette.empty && color !== palette.transparent,
            ghost: isGhost,
            indestructible: false,
            color: isGhost ? palette.ghost : color,
            shadowColor: setAlpha(color, 0.4),
        };
    }

    if (typeof value === 'object') {
        const ghost = Boolean(value.ghost);
        const indestructible = Boolean(value.indestructible);
        const baseColor = resolveColor(
            palette,
            ghost ? value.ghostColor ?? 'ghost' : value.color,
            ghost ? 'ghost' : value.type ?? value.shape ?? value.id
        );
        const color = ghost ? palette.ghost : (indestructible && baseColor === palette.empty
            ? resolveColor(palette, 'indestructible', 'indestructible')
            : baseColor);
        const filled = ghost
            ? false
            : value.filled ?? (color !== palette.empty && color !== palette.transparent);

        return {
            filled,
            ghost,
            indestructible,
            color,
            shadowColor: setAlpha(color, ghost ? 0.25 : 0.45),
        };
    }

    return createEmptyCell(palette);
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

const normalizeActivePiece = (piece, overridePosition, palette) => {
    if (!piece) return null;

    if (Array.isArray(piece.blocks)) {
        const color = resolveColor(palette, piece.color ?? piece.id, piece.id);
        return {
            blocks: piece.blocks,
            position: overridePosition ?? piece.position ?? { x: 0, y: 0 },
            color,
            shadowColor: setAlpha(color, 0.45),
        };
    }

    if (piece.shape && Array.isArray(piece.shape)) {
        const shape = piece.shape;
        const blocks = [];
        for (let y = 0; y < shape.length; y += 1) {
            for (let x = 0; x < shape[y].length; x += 1) {
                if (shape[y][x]) {
                    blocks.push([x, y]);
                }
            }
        }
        const color = resolveColor(palette, piece.color, piece.type ?? piece.id);
        const basePosition = piece.position ?? { x: 0, y: 0 };
        return {
            blocks,
            position: overridePosition ?? basePosition,
            color,
            shadowColor: setAlpha(color, 0.45),
        };
    }

    return null;
};

const Board = styled.div`
    display: grid;
    place-content: center;
    background: rgba(15, 15, 20, 0.45);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.45);
    backdrop-filter: blur(10px) saturate(120%);
    border-radius: 12px;
    overflow: hidden;
    position: relative;
`;

const pop = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.12); }
  100% { transform: scale(0.6); opacity: 0; }
`;

const Cell = styled.div`
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
    box-sizing: border-box;
    position: relative;
    background: ${({ $filled, $ghost }) => {
        if ($ghost) {
            return 'linear-gradient(145deg, rgba(230,229,255,0.08) 0%, rgba(180,175,230,0.02) 100%)';
        }
        return $filled
            ? 'linear-gradient(145deg, var(--cell-color, rgba(191,90,242,1)) 0%, rgba(255,255,255,0.9) 140%)'
            : 'rgba(20,20,25,0.35)';
    }};
    border: ${({ $showGrid, $ghost }) => {
        if ($ghost) return '1px dashed rgba(210,198,255,0.28)';
        return $showGrid ? '1px solid rgba(199,168,255,0.08)' : '1px solid transparent';
    }};
    border-radius: ${({ $filled, $ghost }) => ($ghost ? 2 : $filled ? 3 : 0)}px;
    box-shadow: ${({ $filled, $ghost }) => {
        if ($ghost) return 'inset 0 0 0 1px rgba(210,198,255,0.22)';
        return $filled
            ? '0 0 12px var(--cell-shadow, rgba(0,0,0,0.45)), inset 0 0 1px rgba(255,255,255,0.25)'
            : 'none';
    }};
    opacity: ${({ $ghost }) => ($ghost ? 0.9 : 1)};
    transition: background 180ms ease, box-shadow 180ms ease, border-radius 180ms ease, opacity 180ms ease;

    ${({ $pop, $clearMs }) =>
        $pop && css`
            animation: ${pop} ${$clearMs}ms ease forwards;
        `}

    &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        pointer-events: none;
        background: ${({ $filled, $ghost }) =>
            $filled && !$ghost
                ? 'radial-gradient(120% 80% at 25% 20%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)'
                : 'none'};
    }
`;

const Overlay = styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
`;

const OverlayInner = styled.div`
    position: absolute;
    will-change: transform;
    ${({ $duration }) => css`transition: transform ${$duration}ms cubic-bezier(.2,.7,.2,1);`}
`;

const Block = styled.div`
    position: absolute;
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
    border-radius: 3px;
    background: linear-gradient(145deg, var(--block-color, rgba(191,90,242,1)) 0%, rgba(255,255,255,0.9) 140%);
    box-shadow: 0 0 12px var(--block-shadow, rgba(0,0,0,0.45)), inset 0 0 1px rgba(255,255,255,0.25);
`;

const TetrisGrid = ({
    rows = 20,
    cols = 10,
    cellSize = 24,
    matrix,
    grid,
    showGrid = true,
    colors = BASE_COLOR_PALETTE,
    activePiece,
    currentPiece,
    activePos,
    animateMs = 180,
    clearingRows,
    clearAnimMs = 220,
}) => {
    const palette = useMemo(() => ({ ...BASE_COLOR_PALETTE, ...colors }), [colors]);
    const sourceGrid = grid ?? matrix;

    const resolvedRows = useMemo(() => {
        if (Array.isArray(sourceGrid) && sourceGrid.length) return sourceGrid.length;
        return rows;
    }, [sourceGrid, rows]);

    const resolvedCols = useMemo(() => {
        if (Array.isArray(sourceGrid) && sourceGrid.length) {
            const firstRow = sourceGrid.find((row) => Array.isArray(row));
            if (firstRow && firstRow.length) return firstRow.length;
        }
        return cols;
    }, [sourceGrid, cols]);

    const normalizedGrid = useMemo(
        () => normalizeGrid(sourceGrid, resolvedRows, resolvedCols, palette),
        [sourceGrid, resolvedRows, resolvedCols, palette]
    );

    const clearingSet = useMemo(() => new Set(clearingRows || []), [clearingRows]);

    const normalizedActivePiece = useMemo(
        () => normalizeActivePiece(currentPiece ?? activePiece, activePos, palette),
        [currentPiece, activePiece, activePos, palette]
    );

    const overlay = normalizedActivePiece && normalizedActivePiece.blocks.length > 0 ? (
        <Overlay aria-hidden>
            <OverlayInner
                $duration={animateMs}
                style={{
                    transform: `translate(${normalizedActivePiece.position.x * cellSize}px, ${normalizedActivePiece.position.y * cellSize}px)`,
                }}
            >
                {normalizedActivePiece.blocks.map(([bx, by], index) => (
                    <Block
                        key={index}
                        $size={cellSize}
                        style={{
                            left: bx * cellSize,
                            top: by * cellSize,
                            '--block-color': normalizedActivePiece.color,
                            '--block-shadow': normalizedActivePiece.shadowColor,
                        }}
                    />
                ))}
            </OverlayInner>
        </Overlay>
    ) : null;

    return (
        <Board
            role="grid"
            aria-rowcount={resolvedRows}
            aria-colcount={resolvedCols}
            style={{
                gridTemplateColumns: `repeat(${resolvedCols}, ${cellSize}px)`,
                gridTemplateRows: `repeat(${resolvedRows}, ${cellSize}px)`,
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
                        $size={cellSize}
                        $filled={cell.filled}
                        $ghost={cell.ghost}
                        $showGrid={showGrid}
                        $pop={cell.filled && clearingSet.has(y)}
                        $clearMs={clearAnimMs}
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

const cellValueProp = PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
    PropTypes.shape({
        filled: PropTypes.bool,
        color: PropTypes.string,
        ghost: PropTypes.bool,
        indestructible: PropTypes.bool,
    }),
]);

const pieceShapeProp = PropTypes.shape({
    shape: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    color: PropTypes.string,
    position: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
});

const blocksPieceProp = PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    blocks: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    color: PropTypes.string,
    position: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
});

TetrisGrid.propTypes = {
    rows: PropTypes.number,
    cols: PropTypes.number,
    cellSize: PropTypes.number,
    matrix: PropTypes.arrayOf(PropTypes.arrayOf(cellValueProp)),
    grid: PropTypes.arrayOf(PropTypes.arrayOf(cellValueProp)),
    showGrid: PropTypes.bool,
    colors: PropTypes.object,
    activePiece: PropTypes.oneOfType([pieceShapeProp, blocksPieceProp]),
    currentPiece: PropTypes.oneOfType([pieceShapeProp, blocksPieceProp]),
    activePos: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
    animateMs: PropTypes.number,
    clearingRows: PropTypes.arrayOf(PropTypes.number),
    clearAnimMs: PropTypes.number,
};

export default TetrisGrid;
