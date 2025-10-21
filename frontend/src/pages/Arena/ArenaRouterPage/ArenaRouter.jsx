import { useSelector } from 'react-redux';
import RoomLobbyPage from '../../RoomLobbyPage/RoomLobbyPage';
import { GameLogoTitle, PageWrapper } from './ArenaRouter.styles';
import BackButton from '@/components/Backbutton/BackButton';
import useGameResults from '@/hooks/useGameResults';
import MultiplayerArena from '@/components/MultiplayerArena/MultiplayerArena';

const ArenaRouter = () => {
  const { gameStatus, mode, spectator } = useSelector((state) => state.game);
  const { returnToMenu, spectateGame, leaveRoom } = useGameResults();

  if (gameStatus === 'waiting') {
    return <RoomLobbyPage />;
  }

  return (
    <PageWrapper>
      <BackButton onClick={leaveRoom} />
      <GameLogoTitle>
        {mode === 'multiplayer' ? 'Multiplayer' : 'Game'}
      </GameLogoTitle>
      {mode === 'multiplayer' ? <MultiplayerArena /> : <SoloArena />}
    </PageWrapper>
  );
};

export default ArenaRouter;
