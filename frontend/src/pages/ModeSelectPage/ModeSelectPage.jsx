import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wrapper,
  LogoTitle,
  Card,
  Subtitle,
  StartButton,
} from '../UsernameSetupPage/UsernameSetupPage.styles';
import BackButton from '@/components/Backbutton/BackButton';
import {
  ButtonGrid,
  ModeGrid,
  ModeOption,
  ModeBadge,
  ModeTitle,
  ModeDescription,
  ModeActions,
  SecondaryButton,
} from './ModeSelectPage.styles';
import useGameFlow from '@/hooks/useGameFlow';
import { useSelector } from 'react-redux';
import { SOLO_MODE_OPTIONS } from '@/utils/gameModes';

const ModeSelectPage = () => {
  const navigate = useNavigate();
  const roomName = useSelector((state) => state.game.roomName);
  const [isSelectingSoloMode, setIsSelectingSoloMode] = useState(false);

  const { joinSoloRoom } = useGameFlow({ roomName });
  const handleBack = () => {
    if (isSelectingSoloMode) {
      setIsSelectingSoloMode(false);
      return;
    }
    navigate('/');
  };

  const handleSoloModeSelect = (modeId) => {
    joinSoloRoom(modeId);
  };

  return (
    <Wrapper>
      <BackButton onClick={handleBack} />
      <LogoTitle>Menu</LogoTitle>
      <Card>
        {isSelectingSoloMode ? (
          <>
            <Subtitle>Pick your solo challenge</Subtitle>
            <ModeGrid>
              {SOLO_MODE_OPTIONS.map((mode) => (
                <ModeOption
                  key={mode.id}
                  type="button"
                  onClick={() => handleSoloModeSelect(mode.id)}
                  aria-label={`Start ${mode.title} solo mode`}
                >
                  <ModeBadge>{mode.badge}</ModeBadge>
                  <ModeTitle>{mode.title}</ModeTitle>
                  <ModeDescription>{mode.description}</ModeDescription>
                </ModeOption>
              ))}
            </ModeGrid>
            <ModeActions>
              <SecondaryButton
                type="button"
                onClick={() => setIsSelectingSoloMode(false)}
              >
                Back to main menu
              </SecondaryButton>
            </ModeActions>
          </>
        ) : (
          <>
            <Subtitle>Choose how you want to play</Subtitle>
            <ButtonGrid>
              <StartButton
                onClick={() => setIsSelectingSoloMode(true)}
                aria-label="Choose a solo game mode"
              >
                Solo Journey
              </StartButton>
              <StartButton
                onClick={() => navigate('/join')}
                aria-label="Join an existing room or create one"
              >
                Multiplayer Journey
              </StartButton>
            </ButtonGrid>
          </>
        )}
      </Card>
    </Wrapper>
  );
};

export default ModeSelectPage;
