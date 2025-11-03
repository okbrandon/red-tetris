import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Wrapper,
  Card,
  Subtitle,
  StartButton,
  LogoTitle,
  HintText,
} from '../UsernameSetupPage/UsernameSetupPage.styles';
import BackButton from '@/components/Backbutton/BackButton';
import {
  PlayerList,
  Player,
  ModeSection,
  ModeSelector,
  ModeSelectWrapper,
  ModeSelect,
  ModeDetailCard,
  ModeDetailTitle,
  ModeDetailDescription,
} from './RoomLobbyPage.styles';
import useGameFlow from '@/hooks/useGameFlow';
import { GAME_MODE_OPTIONS, getModeDetails } from '@/utils/gameModes';

const RoomLobbyPage = () => {
  const username = useSelector((state) => state.user.username);
  const { players, roomName, isOwner, roomMode } = useSelector(
    (state) => state.game
  );

  const { startMultiplayerGame, leaveLobby, changeRoomMode } = useGameFlow({
    roomName,
  });
  const activeMode = getModeDetails(roomMode) ?? GAME_MODE_OPTIONS[0];
  const [selectedMode, setSelectedMode] = useState(activeMode.id);
  const previewMode = getModeDetails(selectedMode) ?? activeMode;
  const modeSelectId = 'room-mode-select';
  const modeLabelId = 'room-mode-select-label';
  const modeDescriptionId = 'room-mode-description';

  useEffect(() => {
    setSelectedMode(activeMode.id);
  }, [activeMode.id]);

  const handleModeChange = (event) => {
    const { value } = event.target;
    setSelectedMode(value);
    changeRoomMode(value);
  };

  return (
    <Wrapper>
      <BackButton onClick={leaveLobby} />

      <LogoTitle>Lobby</LogoTitle>

      <Card>
        <Subtitle>Welcome, {username}</Subtitle>
        <Subtitle>{`Lobby name: ${roomName}`}</Subtitle>
        <Subtitle>{`Slots: up to 4 players`}</Subtitle>

        <ModeSection>
          <Subtitle id={modeLabelId}>Game mode</Subtitle>
          <ModeSelector>
            <ModeSelectWrapper>
              <ModeSelect
                id={modeSelectId}
                value={selectedMode}
                onChange={handleModeChange}
                disabled={!isOwner}
                aria-labelledby={modeLabelId}
                aria-describedby={modeDescriptionId}
              >
                {GAME_MODE_OPTIONS.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {`${mode.title} - ${mode.badge}`}
                  </option>
                ))}
              </ModeSelect>
            </ModeSelectWrapper>
            <ModeDetailCard aria-live="polite" id={modeDescriptionId}>
              <ModeDetailTitle>{previewMode.title}</ModeDetailTitle>
              <ModeDetailDescription>
                {previewMode.description}
              </ModeDetailDescription>
            </ModeDetailCard>
          </ModeSelector>
          <HintText>
            {isOwner
              ? 'Choose your challenge, then start the match when everyone is ready.'
              : 'Waiting for the host to pick the challenge. Get ready!'}
          </HintText>
        </ModeSection>

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
