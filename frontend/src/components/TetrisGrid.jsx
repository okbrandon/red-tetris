import styled from 'styled-components';
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
        $filled ? `0 0 10px ${$color.replace('1)', '0.35)')}` : 'none'};

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
    1: 'rgba(162,89,255,1)',   // I
    2: 'rgba(140,70,230,1)',   // L
    3: 'rgba(173,115,255,1)',  // J
    4: 'rgba(186,120,255,1)',  // Z
    5: 'rgba(150,80,240,1)',   // O
    6: 'rgba(132,88,255,1)',   // T
    7: 'rgba(155,95,255,1)',   // S
};

const TetrisGrid = ({ rows = 20, cols = 10, cellSize = 24, matrix, showGrid = true, colors = defaultColors }) => {
  const data = matrix && matrix.length ? matrix : Array.from({ length: rows }, () => Array(cols).fill(0));

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
                        />
                    );
                })
            )}
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
};

export default TetrisGrid;
