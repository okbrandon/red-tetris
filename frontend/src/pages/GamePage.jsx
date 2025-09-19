import styled from 'styled-components';
import { useSelector } from 'react-redux';
import { LogoTitle } from './HomePage.styled';
import BackButton from '../components/BackButton';
import SoloGameView from '../components/SoloGameView';
import MultiplayerArena from '../components/MultiplayerArena';
import { PageWrapper } from './GamePage.styled';

const GamePage = () => {
    const mode = useSelector((state) => state.game.mode);
    const multiplayer = useSelector((state) => state.game.multiplayer);

    return (
        <PageWrapper>
            <BackButton />
            <GameLogoTitle>{mode === 'multiplayer' ? 'Multiplayer' : 'Game'}</GameLogoTitle>
            {mode === 'multiplayer' && !multiplayer.gameOver
                ? <MultiplayerArena players={players} />
                : <SoloGameView />}
        </PageWrapper>
    );
};

const GameLogoTitle = styled(LogoTitle)`
    font-size: clamp(2.1rem, 4vw, 2.8rem);
    margin-bottom: clamp(0.5rem, 1.8vh, 1.2rem);
`;

export default GamePage;
