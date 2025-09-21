import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Wrapper, LogoTitle, Card, Subtitle, StartButton } from './HomePage.styled';
import BackButton from '../components/BackButton';
import { resetGameState, setGameMode } from '../features/game/gameSlice';
import { requestRoomJoin, requestStartGame } from '../features/socket/socketThunks.js';
import { showNotification } from '../features/notification/notificationSlice';
import { useEffect } from 'react';

const MenuPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const gameStatus = useSelector((state) => state.game.gameStatus);
    const gameName = useSelector((state) => state.game.roomName);

    const handleSoloJourney = () => {
        requestRoomJoin({ roomName: 'testt' });
        dispatch(resetGameState());
        dispatch(setGameMode('solo'));
        dispatch(showNotification({ type: 'info', message: 'Starting solo journey...'}));
    }

    useEffect(() => {
        if (gameName && gameName === 'testt')
            requestStartGame();
        if (gameStatus && gameStatus === 'in-game')
            navigate('/game');
    }, [gameStatus, gameName, navigate]);

    return (
        <Wrapper>
            <BackButton />
            <LogoTitle>Menu</LogoTitle>
            <Card>
                <Subtitle>Choose how you want to play</Subtitle>
                <div style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: '1fr', width: 'min(380px, 80vw)', margin: '0 auto' }}>
                    <StartButton
                        onClick={handleSoloJourney}
                        aria-label="Play solo"
                    >
                        Solo Journey
                    </StartButton>
                    <StartButton onClick={() => navigate('/join')} aria-label="Join an existing room or create one">
                        Multiplayer Journey
                    </StartButton>
                </div>
            </Card>
        </Wrapper>
    );
};

export default MenuPage;
