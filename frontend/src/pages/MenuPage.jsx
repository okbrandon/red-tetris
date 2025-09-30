import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';
import { Wrapper, LogoTitle, Card, Subtitle, StartButton } from './HomePage.styled';
import BackButton from '../components/BackButton';
import { SOLO_ROOM_NAME, startSoloGame } from '../features/game/gameSlice.js';
import { showNotification } from '../features/notification/notificationSlice';
import { requestRoomJoin, requestStartGame } from '../features/socket/socketThunks.js';

const MenuPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { mode, gameStatus, roomName } = useSelector((state) => state.game);
    const soloStartRequested = useRef(false);

    const handleSoloJourney = () => {
        dispatch(startSoloGame());
        soloStartRequested.current = false;
        requestRoomJoin({ roomName: SOLO_ROOM_NAME });
        dispatch(showNotification({ type: 'info', message: 'Starting solo journey...'}));
    }

    useEffect(() => {
        if (!soloStartRequested.current
            && mode === 'solo'
            && roomName === SOLO_ROOM_NAME
            && gameStatus === 'waiting') {
            soloStartRequested.current = true;
            requestStartGame();
        }
    }, [gameStatus, mode, roomName]);

    useEffect(() => {
        if (mode !== 'solo' || roomName !== SOLO_ROOM_NAME) {
            soloStartRequested.current = false;
        }
    }, [mode, roomName]);

    useEffect(() => {
        if (gameStatus && gameStatus === 'in-game')
            navigate('/game');
    }, [gameStatus, navigate]);

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
