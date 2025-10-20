import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Wrapper,
  Card,
  Subtitle,
  StartButton,
  LogoTitle,
} from '../HomePage/HomePage.styles';
import BackButton from '@/components/Backbutton/BackButton';
import { PlayerList, Player } from './LobbyPage.styles';
import { showNotification } from '@/store/slices/notificationSlice';
import {
  requestRoomLeave,
  requestStartGame,
} from '@/store/slices/socketThunks.js';

const LobbyPage = () => {
  const { username } = useSelector((state) => state.user);
  const { players, roomName, isOwner } = useSelector((state) => state.game);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleStartGame = () => {
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

  const handleLeaveLobby = () => {
    requestRoomLeave();
    dispatch(showNotification({ type: 'info', message: 'Leaving lobby…' }));
    navigate('/menu');
  };

  return (
    <Wrapper>
      <BackButton onClick={handleLeaveLobby} />

      <LogoTitle>Lobby</LogoTitle>

      <Card>
        <Subtitle>Welcome, {username}</Subtitle>
        <Subtitle>{`Lobby name: ${roomName}`}</Subtitle>
        <Subtitle>{`Slots: up to 4 players`}</Subtitle>

        <PlayerList>
          {players.map((player, index) => (
            <Player key={index}>{player.username}</Player>
          ))}
        </PlayerList>

        <StartButton onClick={handleStartGame} disabled={!isOwner}>
          {isOwner ? 'Start Game' : 'Waiting for host'}
        </StartButton>
      </Card>
    </Wrapper>
  );
};

export default LobbyPage;
