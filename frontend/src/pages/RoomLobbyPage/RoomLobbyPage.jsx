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
import { PlayerList, Player, ModeSection } from './RoomLobbyPage.styles';
import useGameFlow from '@/hooks/useGameFlow';
import {
  ModeGrid,
  ModeOption,
  ModeBadge,
  ModeTitle,
  ModeDescription,
} from '../ModeSelectPage/ModeSelectPage.styles';
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

  return (
    <Wrapper>
      <BackButton onClick={leaveLobby} />

      <LogoTitle>Lobby</LogoTitle>

      <Card>
        <Subtitle>Welcome, {username}</Subtitle>
        <Subtitle>{`Lobby name: ${roomName}`}</Subtitle>
        <Subtitle>{`Slots: up to 4 players`}</Subtitle>

        <ModeSection>
          <Subtitle>{`Game mode: ${activeMode.title}`}</Subtitle>
          <ModeGrid>
            {GAME_MODE_OPTIONS.map((mode) => {
              const isSelected = mode.id === activeMode.id;
              return (
                <ModeOption
                  key={mode.id}
                  type="button"
                  onClick={() => changeRoomMode(mode.id)}
                  data-selected={isSelected}
                  disabled={!isOwner}
                  aria-pressed={isSelected}
                  aria-label={`Set lobby mode to ${mode.title}`}
                >
                  <ModeBadge>{mode.badge}</ModeBadge>
                  <ModeTitle>{mode.title}</ModeTitle>
                  <ModeDescription>{mode.description}</ModeDescription>
                </ModeOption>
              );
            })}
          </ModeGrid>
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
