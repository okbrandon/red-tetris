import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import SpectatorArena from '../SpectatorArenaPage/SpectatorArena.jsx';
import {
  ArenaContainer,
  ArenaLayout,
  MainColumn,
} from './MultiArenaPage.styles.js';
import OpponentList from './components/OpponentList.jsx';
import GameView from '@/components/GameView/GameView.jsx';

const MultiArena = ({ resultModal, leaveRoom }) => {
  const { you, players, grid, spectator } = useSelector((state) => state.game);

  const opponents = useMemo(() => {
    if (!Array.isArray(players)) return [];
    const yourId = you?.id;
    if (!yourId) return players;
    return players.filter((player) => player?.id !== yourId);
  }, [players, you?.id]);

  if (spectator?.active) {
    return <SpectatorArena leaveRoom={leaveRoom} />;
  }

  return (
    <ArenaContainer>
      <ArenaLayout>
        <OpponentList opponents={opponents} />
        <MainColumn>
          <GameView grid={grid} resultModal={resultModal} />
        </MainColumn>
      </ArenaLayout>
    </ArenaContainer>
  );
};

export default MultiArena;
