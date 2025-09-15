import styled from 'styled-components';
import PropTypes from 'prop-types';

const Board = styled.div`
    display: grid;
    width: 100%;
    height: 100%;
    place-content: center;
    position: relative;
    margin: auto;
`;

const Cell = styled.div`
    width: ${({ $size }) => $size}px;
    height: ${({ $size }) => $size}px;
    box-sizing: border-box;
    background: ${({ $filled, $color }) =>
        $filled ? `linear-gradient(145deg, ${$color} 0%, rgba(255,255,255,0.9) 140%)` : 'transparent'};
    border: ${({ $filled }) => ($filled ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent')};
    border-radius: ${({ $filled }) => ($filled ? 3 : 0)}px;
    box-shadow: ${({ $filled, $color }) => ($filled ? `0 0 8px ${$color.replace('1)', '0.35)')}` : 'none')};
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

const buildPreviewMatrix = (piece) => {
    const rows = 4, cols = 4;
    const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
    if (!piece) return matrix;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of piece.blocks) {
        if (x < minX) minX = x; if (y < minY) minY = y;
        if (x > maxX) maxX = x; if (y > maxY) maxY = y;
    }
    const width = maxX - minX + 1;
    const offsetX = Math.floor((cols - width) / 2) - minX;
    const offsetY = -minY;

    for (const [bx, by] of piece.blocks) {
        const x = bx + offsetX;
        const y = by + offsetY;
        if (x >= 0 && x < cols && y >= 0 && y < rows) matrix[y][x] = piece.id;
    }
    return matrix;
};

const NextPiecePreview = ({ piece, cellSize = 18, colors = defaultColors }) => {
    const data = buildPreviewMatrix(piece);
    return (
        <Board style={{ gridTemplateColumns: `repeat(4, ${cellSize}px)`, gridTemplateRows: `repeat(4, ${cellSize}px)` }}>
            {data.map((r, y) =>
                r.map((v, x) => (
                    <Cell key={`${y}-${x}`} $size={cellSize} $filled={v > 0} $color={colors[v] || colors[1]} />
                ))
            )}
        </Board>
    );
};
NextPiecePreview.propTypes = {
    piece: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        blocks: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    }),
    cellSize: PropTypes.number,
    colors: PropTypes.object,
};

export default NextPiecePreview;
