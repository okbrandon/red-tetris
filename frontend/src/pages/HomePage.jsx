import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUsername } from '../features/user/userSlice';
import { Wrapper, StartButton, Input, LogoTitle } from './HomePage.styled';
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

            <Input
                type="text"
                value={name}
                placeholder="Enter your name"
                onChange={(e) => setName(e.target.value)}
            />

            <StartButton onClick={handleStart}>Start</StartButton>
        </Wrapper>
    );
};

export default HomePage;
