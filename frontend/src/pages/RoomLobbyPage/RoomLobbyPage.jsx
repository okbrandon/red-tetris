import { useSelector } from 'react-redux';
import {
  Wrapper,
  Card,
  Subtitle,
  StartButton,
  LogoTitle,
} from '../UsernameSetupPage/UsernameSetupPage.styles';
import BackButton from '@/components/Backbutton/BackButton';
import { PlayerList, Player } from './RoomRoomLobbyPage.styles';
import useGameFlow from '@/hooks/useGameFlow';

const RoomLobbyPage = () => {
  const username = useSelector((state) => state.user.username);
  const { players, roomName, isOwner } = useSelector(
    (state) => state.game
  );

  const { startMultiplayerGame, leaveLobby } = useGameFlow({ roomName });

  return (
    <Wrapper>
      <BackButton onClick={leaveLobby} />

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

        <StartButton onClick={startMultiplayerGame} disabled={!isOwner}>
          {isOwner ? 'Start Game' : 'Waiting for host'}
        </StartButton>
      </Card>
    </Wrapper>
  );
};

export default RoomLobbyPage;
