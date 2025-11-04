import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUsername } from '@/store/slices/userThunks.js';
import { showNotification } from '@/store/slices/notificationSlice.js';
import {
  Wrapper,
  StartButton,
  Input,
  LogoTitle,
  Card,
  Subtitle,
  FormRow,
  HintText,
} from './UsernameSetupPage.styles';
import { resetGameState } from '@/store/slices/gameSlice';
import { resetUser } from '@/store/slices/userSlice';
import { clearSocketEvent, resetSocketState } from '@/store/slices/socketSlice';
import { SERVER_EVENTS } from '@/services/socket/events.js';

const UsernameSetupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingName, setPendingName] = useState(null);
  const dispatch = useDispatch();
  const lastSocketEvent = useSelector((state) => state.socket.lastEvent);

  useEffect(() => {
    dispatch(resetGameState());
    dispatch(resetUser());
    dispatch(resetSocketState());
    window.localStorage.removeItem('username');
  }, [dispatch]);

  useEffect(() => {
    if (
      !isSubmitting ||
      !pendingName ||
      !lastSocketEvent ||
      lastSocketEvent.direction !== 'incoming'
    ) {
      return;
    }

    if (lastSocketEvent.type === SERVER_EVENTS.ERROR) {
      dispatch(clearSocketEvent());
      setIsSubmitting(false);
      setPendingName(null);
      return;
    }

    if (lastSocketEvent.type === SERVER_EVENTS.CLIENT_UPDATED) {
      const serverUsername =
        typeof lastSocketEvent.payload?.username === 'string'
          ? lastSocketEvent.payload.username.trim()
          : null;
      const welcomedName = serverUsername || pendingName;
      dispatch(clearSocketEvent());
      setIsSubmitting(false);
      setPendingName(null);
      dispatch(
        showNotification({
          type: 'success',
          message: `Welcome ${welcomedName}!`,
        })
      );
      navigate('/menu');
    }
  }, [dispatch, isSubmitting, lastSocketEvent, navigate, pendingName]);

  const handleStart = () => {
    if (isSubmitting) return;

    const trimmed = name.trim();

    if (trimmed) {
      dispatch(clearSocketEvent());
      setPendingName(trimmed);
      setIsSubmitting(true);
      updateUsername(trimmed);
    } else {
      dispatch(
        showNotification({
          type: 'error',
          message: 'Please enter a name to continue.',
        })
      );
    }
  };

  return (
    <Wrapper>
      <LogoTitle>Red-Tetris</LogoTitle>

      <Card>
        <Subtitle>Fast, neon, multiplayer — drop in and play.</Subtitle>

        <FormRow>
          <Input
            type="text"
            value={name}
            placeholder="Enter your name"
            aria-label="Enter your name"
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleStart();
            }}
          />

          <StartButton
            onClick={handleStart}
            disabled={!name.trim() || isSubmitting}
          >
            Start
          </StartButton>
        </FormRow>

        <HintText>Press Enter to start</HintText>
      </Card>
    </Wrapper>
  );
};

export default UsernameSetupPage;
