import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Wrapper,
  Card,
  Subtitle,
  StartButton,
  LogoTitle,
  Input,
} from '../UsernameSetupPage/UsernameSetupPage.styles.js';
import BackButton from '@/components/Backbutton/BackButton.jsx';
import { JoinForm, JoinHint } from './RoomAccessPage.styles.js';
import useGameFlow from '@/hooks/useGameFlow.js';

const RoomAccessPage = () => {
  const navigate = useNavigate();
  const { roomName: originalRoomName } = useSelector((state) => state.game);
  const [roomName, setRoomName] = useState(originalRoomName);

  const { joinMultiplayerRoom } = useGameFlow({ roomName });

  return (
    <Wrapper>
      <BackButton onClick={() => navigate('/menu')} />
      <LogoTitle>Multiplayer</LogoTitle>
      <Card>
        <Subtitle>Enter a room name</Subtitle>
        <JoinForm>
          <Input
            type="text"
            value={roomName}
            placeholder="Enter room name"
            aria-label="Room name"
            onChange={(event) => setRoomName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && roomName.trim())
                joinMultiplayerRoom();
            }}
          />
          <StartButton
            onClick={joinMultiplayerRoom}
            disabled={!roomName.trim()}
          >
            Join Lobby
          </StartButton>
          <JoinHint>Join an existing room or create a new one.</JoinHint>
        </JoinForm>
      </Card>
    </Wrapper>
  );
};

export default RoomAccessPage;
