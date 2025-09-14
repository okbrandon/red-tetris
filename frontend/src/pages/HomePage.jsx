import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUsername } from '../features/user/userSlice';
import { Wrapper, StartButton, Input, LogoTitle, Card, Subtitle, FormRow, HintText } from './HomePage.styled';
import AnimatedBackground from '../components/AnimatedBackground';

const HomePage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const dispatch = useDispatch();

    const handleStart = () => {
        if (name.trim()) {
            dispatch(setUsername(name));
            navigate('/lobby');
        } else {
            alert('Please enter a name');
        }
    };

    return (
        <Wrapper>
            <AnimatedBackground />

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

export default HomePage;
