import {
  setIsResultModalOpen,
  setSpectatorActive,
} from '@/store/slices/gameSlice';
import { showNotification } from '@/store/slices/notificationSlice';
import { requestRoomLeave } from '@/store/slices/socketThunks';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const useGameResults = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { gameStatus, playerOutcome, isResultModalOpen } = useSelector(
    (state) => state.game
  );

  useEffect(() => {
    if (
      gameStatus === 'game-over' ||
      (gameStatus === 'in-game' && playerOutcome?.outcome)
    ) {
      dispatch(setIsResultModalOpen(true));
      console.log('Opening result modal');
    }
  }, [gameStatus, playerOutcome, dispatch]);

  useEffect(() => {
    if (
      gameStatus === 'in-game' &&
      !playerOutcome?.outcome &&
      isResultModalOpen
    ) {
      dispatch(setIsResultModalOpen(false));
      console.log('Closing result modal');
    }
  }, [gameStatus, playerOutcome, dispatch, isResultModalOpen]);

  useEffect(() => {
    if (!gameStatus) {
      navigate('/menu');
      console.log('No active game, navigating to menu');
    }
  }, [gameStatus, navigate]);

  const returnToMenu = () => {
    dispatch(setIsResultModalOpen(false));
    dispatch(setSpectatorActive(false));
    requestRoomLeave();
    dispatch(showNotification({ type: 'info', message: 'Returning to menu…' }));
    console.log('Returning to menu');
  };

  const spectateGame = () => {
    dispatch(setSpectatorActive(true));
    dispatch(setIsResultModalOpen(false));
  };

  const leaveRoom = () => {
    dispatch(setSpectatorActive(false));
    requestRoomLeave();
    dispatch(showNotification({ type: 'info', message: 'Leaving room…' }));
    console.log('Leaving room');
  };

  return { returnToMenu, spectateGame, leaveRoom };
};

export default useGameResults;
