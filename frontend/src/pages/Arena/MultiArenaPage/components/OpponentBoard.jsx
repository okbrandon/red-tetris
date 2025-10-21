import PropTypes from 'prop-types';
import TetrisGrid from '@/components/TetrisGrid/TetrisGrid.jsx';
import { DEFAULT_COLS, DEFAULT_ROWS } from '../constants.js';
import {
  MiniBoard,
  OpponentBadge,
  OpponentCard,
  OpponentHeader,
  OpponentName,
} from '../MultiArenaPage.styles.js';

const OpponentBoard = ({ opponent, index, cellSize }) => {
  const board = Array.isArray(opponent?.specter) ? opponent.specter : [];
  const displayName =
    opponent?.username ?? opponent?.name ?? `Opponent ${index + 1}`;

  return (
    <OpponentCard>
      <OpponentHeader>
        <OpponentBadge>{`Player ${index + 1}`}</OpponentBadge>
        <OpponentName>{displayName}</OpponentName>
      </OpponentHeader>
      <MiniBoard>
        <TetrisGrid
          rows={DEFAULT_ROWS}
          cols={DEFAULT_COLS}
          cellSize={cellSize}
          showGrid={false}
          grid={board}
        />
      </MiniBoard>
    </OpponentCard>
  );
};

OpponentBoard.propTypes = {
  opponent: PropTypes.shape({
    id: PropTypes.string,
    username: PropTypes.string,
    name: PropTypes.string,
    specter: PropTypes.arrayOf(PropTypes.array),
  }),
  index: PropTypes.number.isRequired,
  cellSize: PropTypes.number.isRequired,
};

OpponentBoard.defaultProps = {
  opponent: undefined,
};

export default OpponentBoard;
