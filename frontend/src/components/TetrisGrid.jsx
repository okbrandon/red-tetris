import { useMemo } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { BASE_TETRIS_COLORS, extractPieceBlocks } from '../utils/tetris.js';

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
    console.log('grid in normalizeGrid:', grid);
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
    transition: transform 180ms cubic-bezier(.2,.7,.2,1);
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
                    transform: `translate(${normalizedCurrentPiece.position.x * cellSize}px, ${normalizedCurrentPiece.position.y * cellSize}px)`,
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
