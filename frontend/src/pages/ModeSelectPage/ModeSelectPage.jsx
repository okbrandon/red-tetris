import { useNavigate } from 'react-router-dom';
import {
  Wrapper,
  LogoTitle,
  Card,
  Subtitle,
  StartButton,
} from '../UsernameSetupPage/UsernameSetupPage.styles';
import BackButton from '@/components/Backbutton/BackButton';
import { ButtonGrid } from './ModeSelectPage.styles';
import useGameFlow from '@/hooks/useGameFlow';
import { useSelector } from 'react-redux';

const ModeSelectPage = () => {
  const navigate = useNavigate();
  const roomName = useSelector((state) => state.game.roomName);

  const { joinSoloRoom } = useGameFlow({ roomName });

  return (
    <Wrapper>
      <BackButton onClick={() => navigate('/')} />
      <LogoTitle>Menu</LogoTitle>
      <Card>
        <Subtitle>Choose how you want to play</Subtitle>
        <ButtonGrid>
          <StartButton onClick={joinSoloRoom} aria-label="Play solo">
            Solo Journey
          </StartButton>
          <StartButton
            onClick={() => navigate('/join')}
            aria-label="Join an existing room or create one"
          >
            Multiplayer Journey
          </StartButton>
        </ButtonGrid>
      </Card>
    </Wrapper>
  );
};

export default ModeSelectPage;
