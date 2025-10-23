import { SOLO_ROOM_NAME } from '@/store/slices/gameSlice';
import { showNotification } from '@/store/slices/notificationSlice';
import {
  requestRoomJoin,
  requestRoomLeave,
  requestStartGame,
} from '@/store/slices/socketThunks';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const useGameFlow = ({ roomName }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isOwner, mode, gameStatus } = useSelector((state) => state.game);
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

  const joinSoloRoom = () => {
    requestRoomJoin({ roomName: SOLO_ROOM_NAME, soloJourney: true });
    dispatch(
      showNotification({ type: 'info', message: 'Starting solo journey...' })
    );
  };

  const joinMultiplayerRoom = () => {
    const trimmedRoomName = roomName.trim();
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

  return {
    joinSoloRoom,
    joinMultiplayerRoom,
    startMultiplayerGame,
    leaveLobby,
  };
};

export default useGameFlow;
