import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  createPreviewData,
  DEFAULT_PREVIEW_COLS,
  DEFAULT_PREVIEW_ROWS,
} from '@/utils/tetrisPreview.js';
import { Board, Cell } from './NextPiecePreview.styles.js';

const NextPiecePreview = ({ piece, cellSize = 18 }) => {
  const preview = useMemo(() => createPreviewData(piece), [piece]);

  return (
    <Board
      style={{
        gridTemplateColumns: `repeat(${DEFAULT_PREVIEW_COLS}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${DEFAULT_PREVIEW_ROWS}, ${cellSize}px)`,
      }}
    >
      {preview.matrix.map((r, y) =>
        r.map((v, x) => (
          <Cell
            key={`${y}-${x}`}
            $size={cellSize}
            $filled={v > 0}
            $color={preview.color}
          />
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
    color: PropTypes.string,
  }),
  cellSize: PropTypes.number,
};

export default NextPiecePreview;
