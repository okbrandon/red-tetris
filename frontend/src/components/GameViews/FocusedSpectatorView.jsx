import { useMemo } from 'react';
import propTypes from 'prop-types';
import TetrisGrid from '../TetrisGrid/TetrisGrid.jsx';
import { computeStats } from '@/utils/tetris.js';
import {
  Layout,
  BoardArea,
  BoardFrame,
  FocusedStats,
  StatRow,
  StatLabel,
  StatValue,
  SpectatorActions,
  ExitButton,
} from './GameView.styles.js';

const FocusedSpectatorView = ({ grid, focusedPlayer, leaveRoom }) => {
  const stats = useMemo(() => computeStats(focusedPlayer), [focusedPlayer]);

  return (
    <Layout>
      <BoardArea>
        <BoardFrame>
          <TetrisGrid showGrid grid={grid} />
        </BoardFrame>
        {stats.length > 0 && (
          <FocusedStats>
            {stats.map(({ label, value }) => (
              <StatRow key={label}>
                <StatLabel>{label}</StatLabel>
                <StatValue>{value}</StatValue>
              </StatRow>
            ))}
          </FocusedStats>
        )}
      </BoardArea>
      <SpectatorActions>
        <ExitButton type="button" onClick={leaveRoom}>
          Leave Game
        </ExitButton>
      </SpectatorActions>
    </Layout>
  );
};

FocusedSpectatorView.propTypes = {
  grid: propTypes.arrayOf(propTypes.array).isRequired,
  focusedPlayer: propTypes.object,
  leaveRoom: propTypes.func,
};

export default FocusedSpectatorView;
