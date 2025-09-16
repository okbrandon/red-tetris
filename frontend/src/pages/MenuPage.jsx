import { useNavigate } from 'react-router-dom';
import { Wrapper, LogoTitle, Card, Subtitle, StartButton } from './HomePage.styled';
import BackButton from '../components/BackButton';

const MenuPage = () => {
    const navigate = useNavigate();

    return (
        <Wrapper>
            <BackButton />
            <LogoTitle>Menu</LogoTitle>
            <Card>
                <Subtitle>Choose how you want to play</Subtitle>
                <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr', width: 'min(380px, 80vw)', margin: '0 auto' }}>
                    <StartButton onClick={() => navigate('/game')} aria-label="Play solo">
                        Play
                    </StartButton>
                    <StartButton onClick={() => navigate('/join')} aria-label="Join an existing room">
                        Join Game
                    </StartButton>
                    <StartButton onClick={() => navigate('/host')} aria-label="Host a new room">
                        Host Game
                    </StartButton>
                </div>
            </Card>
        </Wrapper>
    );
};

export default MenuPage;
