import styled from 'styled-components';
import PropTypes from 'prop-types';
import { BASE_TETRIS_COLORS, extractPieceBlocks } from '../utils/tetris.js';

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

const buildPreviewMatrix = (piece) => {
    const rows = 4;
    const cols = 4;
    const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
    if (!piece) return matrix;

    const blocks = extractPieceBlocks(piece);
    if (blocks.length === 0) return matrix;

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const [x, y] of blocks) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
    }

    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    const offsetX = Math.floor((cols - width) / 2) - minX;
    const offsetY = Math.floor((rows - height) / 2) - minY;

    for (const [bx, by] of blocks) {
        const x = bx + offsetX;
        const y = by + offsetY;
        if (x >= 0 && x < cols && y >= 0 && y < rows) {
            matrix[y][x] = 1;
        }
    }

    return matrix;
};

const NextPiecePreview = ({ piece, cellSize = 18 }) => {
    const colors = BASE_TETRIS_COLORS;
    const data = buildPreviewMatrix(piece);
    const paletteColor = colors[piece.color] ?? colors[1];
    return (
        <Board style={{ gridTemplateColumns: `repeat(4, ${cellSize}px)`, gridTemplateRows: `repeat(4, ${cellSize}px)` }}>
            {data.map((r, y) =>
                r.map((v, x) => (
                    <Cell key={`${y}-${x}`} $size={cellSize} $filled={v > 0} $color={paletteColor} />
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
        shape: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    }),
    cellSize: PropTypes.number,
    colors: PropTypes.object,
};

export default NextPiecePreview;
