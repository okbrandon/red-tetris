import { useMemo } from 'react';
import propTypes from 'prop-types';
import { useSelector } from 'react-redux';
import SpectatorArena from '../SpectatorArenaPage/SpectatorArena.jsx';
import {
  ArenaContainer,
  ArenaLayout,
  MainColumn,
} from './MultiArenaPage.styles.js';
import SpecterColumn from '@/components/SpecterColumn/SpecterColumn.jsx';
import { resultModalShape } from '@/components/GameResultModal/GameResultModal.propTypes.js';
import GamePlayingView from '@/components/GameViews/GamePlayingView.jsx';

const MultiArena = ({ resultModal, leaveRoom }) => {
  const { you, players, grid, spectator, score, nextPieces } = useSelector(
    (state) => state.game
  );

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
          <GamePlayingView
            grid={grid}
            resultModal={resultModal}
            score={score}
            nextPieces={nextPieces}
          />
        </MainColumn>
      </ArenaLayout>
    </ArenaContainer>
  );
};

MultiArena.propTypes = {
  resultModal: resultModalShape.isRequired,
  leaveRoom: propTypes.func.isRequired,
};

export default MultiArena;
