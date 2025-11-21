import { SOLO_ROOM_NAME } from '@/store/slices/gameSlice';
import { showNotification } from '@/store/slices/notificationSlice';
import {
  requestRoomJoin,
  requestRoomLeave,
  requestStartGame,
  requestRoomModeChange,
} from '@/store/slices/socketThunks';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const useGameFlow = ({ roomName }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isOwner, mode, gameStatus, roomMode } = useSelector(
    (state) => state.game
  );
  const username = useSelector((state) => state.user.username);

  useEffect(() => {
    if (mode === 'solo' && roomName && gameStatus !== 'in-game') {
      requestStartGame();
      console.log('useGameFlow: Starting solo game');
    }
  }, [mode, roomName, gameStatus]);

  useEffect(() => {
    if (mode === 'solo' && roomName && gameStatus === 'in-game') {
      navigate(`/${roomName}/${username}`);
      console.log('useGameFlow: Navigating to solo game arena');
    }
  }, [mode, roomName, gameStatus, navigate, username]);

  useEffect(() => {
    if (mode === 'multiplayer' && roomName && gameStatus === 'waiting') {
      navigate(`/${roomName}/${username}`);
      console.log('useGameFlow: Navigating to multiplayer lobby');
    }
  }, [mode, roomName, navigate, username, gameStatus]);

  const joinSoloRoom = (selectedMode = 'classic') => {
    requestRoomJoin({
      roomName: SOLO_ROOM_NAME,
      soloJourney: true,
      mode: selectedMode,
    });
    dispatch(
      showNotification({ type: 'info', message: 'Starting solo journey...' })
    );
  };

  const joinMultiplayerRoom = (targetRoomName) => {
    const candidate =
      typeof targetRoomName === 'string' ? targetRoomName : roomName;
    const trimmedRoomName =
      typeof candidate === 'string' ? candidate.trim() : '';
    if (!trimmedRoomName) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Enter a room name to join a lobby.',
        })
      );
      return;
    }
    requestRoomJoin({ roomName: trimmedRoomName, soloJourney: false });
    dispatch(
      showNotification({
        type: 'success',
        message: `Joining lobby ${trimmedRoomName}…`,
      })
    );
  };

  const startMultiplayerGame = () => {
    if (!isOwner) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Only the lobby owner can start the game.',
        })
      );
      return;
    }
    requestStartGame();
  };

  const leaveLobby = () => {
    requestRoomLeave();
    dispatch(showNotification({ type: 'info', message: 'Leaving lobby…' }));
  };

  const changeRoomMode = (newMode) => {
    if (!isOwner) {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Only the lobby owner can change the game mode.',
        })
      );
      return;
    }

    if (!newMode || newMode === roomMode) {
      return;
    }

    requestRoomModeChange({ mode: newMode });
  };

  return {
    joinSoloRoom,
    joinMultiplayerRoom,
    startMultiplayerGame,
    leaveLobby,
    changeRoomMode,
  };
};

export default useGameFlow;
