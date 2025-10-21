import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import BackButton from '@/components/Backbutton/BackButton';
import GameView from '@/components/GameView/GameView.jsx';
import { PageWrapper, SoloArena, GameLogoTitle } from './GamePlayPage.styles';
import MultiplayerArena from '@/components/MultiplayerArena/MultiplayerArena';
import RoomLobbyPage from '../RoomLobbyPage/RoomLobbyPage.jsx';
import useGameResults from '@/hooks/useGameResults';

const GamePlayPage = () => {
  const { mode, gameStatus, grid, playerOutcome, isOwner, spectator, isResultModalOpen } =
    useSelector((state) => state.game);

  const isMultiplayer = mode === 'multiplayer';

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

  return gameStatus === 'waiting' || !grid[0].length ? (
    <RoomLobbyPage />
  ) : (
    <PageWrapper>
      <BackButton onClick={leaveRoom} />
      <GameLogoTitle>{isMultiplayer ? 'Multiplayer' : 'Game'}</GameLogoTitle>
      {isMultiplayer ? (
        <MultiplayerArena
          grid={grid}
          resultModal={resultModalProps}
          showSpectators={Boolean(spectator?.active)}
          onLeaveGame={leaveRoom}
        />
      ) : (
        <SoloArena>
          <GameView grid={grid} resultModal={resultModalProps} />
        </SoloArena>
      )}
    </PageWrapper>
  );
};

export default GamePlayPage;
