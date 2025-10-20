import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import {
  Wrapper,
  LogoTitle,
  Card,
  Subtitle,
  StartButton,
} from '../UsernameSetupPage/UsernameSetupPage.styles';
import BackButton from '@/components/Backbutton/BackButton';
import { SOLO_ROOM_NAME } from '@/store/slices/gameSlice.js';
import { showNotification } from '@/store/slices/notificationSlice';
import {
  requestRoomJoin,
  requestStartGame,
} from '@/store/slices/socketThunks.js';
import { ButtonGrid } from './ModeSelectPage.styles';

const MenuPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mode, gameStatus, roomName } = useSelector(
    (state) => state.game
  );
  const username = useSelector((state) => state.user.username);

  const handleSoloJourney = () => {
    requestRoomJoin({ roomName: SOLO_ROOM_NAME, soloJourney: true });
    dispatch(
      showNotification({ type: 'info', message: 'Starting solo journey...' })
    );
  };

  useEffect(() => {
    if (mode === 'solo' && roomName && gameStatus === 'in-game') {
      requestStartGame();
    }
  }, [mode, roomName, gameStatus]);

  useEffect(() => {
    if (mode === 'solo' && roomName && gameStatus === 'in-game') {
      navigate(`/${roomName}/${username}`);
    }
  }, [mode, roomName, gameStatus, navigate, username]);

  return (
    <Wrapper>
      <BackButton onClick={() => navigate('/')} />
      <LogoTitle>Menu</LogoTitle>
      <Card>
        <Subtitle>Choose how you want to play</Subtitle>
        <ButtonGrid>
          <StartButton onClick={handleSoloJourney} aria-label="Play solo">
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

export default MenuPage;
