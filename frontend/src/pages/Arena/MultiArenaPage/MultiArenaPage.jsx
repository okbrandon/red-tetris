import { useMemo } from 'react';
import propTypes from 'prop-types';
import { useSelector } from 'react-redux';
import SpectatorArena from '../SpectatorArenaPage/SpectatorArena.jsx';
import {
  ArenaContainer,
  ArenaLayout,
  MainColumn,
} from './MultiArenaPage.styles.js';
import GameView from '@/components/GameView/GameView.jsx';
import SpecterColumn from '@/components/SpecterColumn/SpecterColumn.jsx';

const MultiArena = ({ resultModal, leaveRoom }) => {
  const { you, players, grid, spectator } = useSelector((state) => state.game);

  const opponents = useMemo(() => {
    if (!Array.isArray(players)) return [];
    const yourId = you?.id;
    if (!yourId) return players;
    return players.filter((player) => player?.id !== yourId);
  }, [players, you?.id]);

  if (spectator?.active) {
    return <SpectatorArena leaveRoom={leaveRoom} opponents={opponents} />;
  }

  return (
    <ArenaContainer>
      <ArenaLayout>
        <SpecterColumn opponents={opponents} />
        <MainColumn>
          <GameView grid={grid} resultModal={resultModal} isPlaying={true} />
        </MainColumn>
      </ArenaLayout>
    </ArenaContainer>
  );
};

MultiArena.propTypes = {
  resultModal: propTypes.node.isRequired,
  leaveRoom: propTypes.func.isRequired,
};

export default MultiArena;
