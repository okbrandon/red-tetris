import { useNavigate } from 'react-router-dom';
import { Wrapper, Glow, Title, StartButton } from './HomePage.styles';

const HomePage = () => {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/lobby');
    };

    return (
        <Wrapper>
            <Glow className="top-left" />
            <Glow className="bottom-right" />
            <Title>Red-Tetris</Title>
            <StartButton onClick={handleStart}>Start</StartButton>
        </Wrapper>
    );
};

export default HomePage;
