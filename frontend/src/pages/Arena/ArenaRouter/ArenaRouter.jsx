import { useSelector } from 'react-redux';
import RoomLobbyPage from '../../RoomLobbyPage/RoomLobbyPage';
import { GameLogoTitle, PageWrapper } from './ArenaRouter.styles';
import BackButton from '@/components/Backbutton/BackButton';
import useGameResults from '@/hooks/useGameResults';
import MultiArena from '@/pages/Arena/MultiArenaPage/MultiArenaPage.jsx';
import SoloArena from '../SoloArenaPage/SoloArenaPage';
import { useMemo } from 'react';

const ArenaRouter = () => {
  const {
    gameStatus,
    mode,
    spectator,
    playerOutcome,
    isOwner,
    isResultModalOpen,
  } = useSelector((state) => state.game);
  const { returnToMenu, spectateGame, leaveRoom } = useGameResults();

  const resultModalProps = useMemo(
    () => ({
      isOpen: isResultModalOpen,
      outcome: playerOutcome,
      onConfirm: returnToMenu,
      isOwner,
      canSpectate: Boolean(spectator?.eligible),
      onSpectate: spectateGame,
      isGameOver: gameStatus === 'game-over',
    }),
    [
      isResultModalOpen,
      playerOutcome,
      isOwner,
      spectator,
      gameStatus,
      returnToMenu,
      spectateGame,
    ]
  );

  if (gameStatus === 'waiting') {
    return <RoomLobbyPage />;
  }

  return (
    <PageWrapper>
      <BackButton onClick={leaveRoom} />
      <GameLogoTitle>
        {mode === 'multiplayer' ? 'Multiplayer' : 'Game'}
      </GameLogoTitle>
      {mode === 'multiplayer' ? (
        <MultiArena resultModal={resultModalProps} />
      ) : (
        <SoloArena resultModal={resultModalProps} />
      )}
    </PageWrapper>
  );
};

export default ArenaRouter;
