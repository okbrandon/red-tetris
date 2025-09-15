import styled, { css, keyframes } from 'styled-components';
import PropTypes from 'prop-types';

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
    background: ${({ $filled, $color }) =>
        $filled ? `linear-gradient(145deg, ${$color} 0%, rgba(255,255,255,0.9) 140%)` : 'rgba(20,20,25,0.35)'};
    border: ${({ $showGrid }) => ($showGrid ? '1px solid rgba(199,168,255,0.08)' : '1px solid transparent')};
    border-radius: ${({ $filled }) => ($filled ? 3 : 0)}px;
    box-shadow: ${({ $filled, $color }) =>
        $filled ? `0 0 12px ${$color.replace('1)', '0.45)')}, inset 0 0 1px rgba(255,255,255,0.25)` : 'none'};

    transition: background 180ms ease, box-shadow 180ms ease, border-radius 180ms ease;

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
        background: ${({ $filled }) =>
        $filled
            ? 'radial-gradient(120% 80% at 25% 20%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)'
            : 'none'};
    }
`;

const defaultColors = {
    1: 'rgba(0,229,255,1)',    // I - cyan
    2: 'rgba(255,149,0,1)',    // L - orange
    3: 'rgba(0,122,255,1)',    // J - blue
    4: 'rgba(255,59,48,1)',    // Z - red
    5: 'rgba(255,214,10,1)',   // O - yellow
    6: 'rgba(191,90,242,1)',   // T - purple
    7: 'rgba(52,199,89,1)',    // S - green
};

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
    background: ${({ $color }) => `linear-gradient(145deg, ${$color} 0%, rgba(255,255,255,0.9) 140%)`};
    box-shadow: ${({ $color }) => `0 0 12px ${$color.replace('1)', '0.45)')}, inset 0 0 1px rgba(255,255,255,0.25)`};
`;

const TetrisGrid = ({ rows = 20, cols = 10, cellSize = 24, matrix, showGrid = true, colors = defaultColors, activePiece, activePos, animateMs = 180, clearingRows, clearAnimMs = 220 }) => {
  const data = matrix && matrix.length ? matrix : Array.from({ length: rows }, () => Array(cols).fill(0));
  const clearingSet = new Set(clearingRows || []);

    const overlay = activePiece && activePos ? (
        <Overlay aria-hidden>
            <OverlayInner
                $duration={animateMs}
                style={{ transform: `translate(${activePos.x * cellSize}px, ${activePos.y * cellSize}px)` }}
            >
                {activePiece.blocks.map(([bx, by], i) => (
                    <Block
                        key={i}
                        $size={cellSize}
                        $color={colors[activePiece.id] || colors[1]}
                        style={{ left: bx * cellSize, top: by * cellSize }}
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
            style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gridTemplateRows: `repeat(${rows}, ${cellSize}px)` }}
        >
            {data.map((r, y) =>
                r.map((v, x) => {
                    const isFilled = v > 0;
                    const color = colors[v] || 'rgba(162,89,255,1)';
                    return (
                        <Cell
                            key={`${y}-${x}`}
                            role="gridcell"
                            data-testid="cell"
                            data-filled={isFilled ? 'true' : 'false'}
                            $size={cellSize}
                            $filled={isFilled}
                            $color={color}
                            $showGrid={showGrid}
                            $pop={isFilled && clearingSet.has(y)}
                            $clearMs={clearAnimMs}
                        />
                    );
                })
            )}
            {overlay}
        </Board>
    );
};
TetrisGrid.propTypes = {
    rows: PropTypes.number,
    cols: PropTypes.number,
    cellSize: PropTypes.number,
    matrix: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    showGrid: PropTypes.bool,
    colors: PropTypes.object,
    activePiece: PropTypes.shape({ id: PropTypes.number, blocks: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)) }),
    activePos: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
    animateMs: PropTypes.number,
    clearingRows: PropTypes.arrayOf(PropTypes.number),
    clearAnimMs: PropTypes.number,
};

export default TetrisGrid;
