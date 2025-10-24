import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
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
import { resetSocketState } from '@/store/slices/socketSlice';

const UsernameSetupPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(resetGameState());
    dispatch(resetUser());
    dispatch(resetSocketState());
    window.localStorage.removeItem('username');
  }, [dispatch]);

  const handleStart = () => {
    const trimmed = name.trim();

    if (trimmed) {
      updateUsername(trimmed);
      dispatch(
        showNotification({ type: 'success', message: `Welcome ${trimmed}!` })
      );
      navigate('/menu');
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

          <StartButton onClick={handleStart} disabled={!name.trim()}>
            Start
          </StartButton>
        </FormRow>

        <HintText>Press Enter to start</HintText>
      </Card>
    </Wrapper>
  );
};

export default UsernameSetupPage;
