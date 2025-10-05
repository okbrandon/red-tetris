import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { Wrapper, LogoTitle, Card, Subtitle, StartButton } from './HomePage.styled';
import BackButton from '../components/BackButton';
import { SOLO_ROOM_NAME } from '../features/game/gameSlice.js';
import { showNotification } from '../features/notification/notificationSlice';
import { requestRoomJoin, requestStartGame } from '../features/socket/socketThunks.js';

const MenuPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { mode, gameStatus, roomName } = useSelector((state) => state.game);
    const { username } = useSelector((state) => state.user);

    const handleSoloJourney = () => {
        requestRoomJoin({ roomName: SOLO_ROOM_NAME, soloJourney: true });
        dispatch(showNotification({ type: 'info', message: 'Starting solo journey...'}));
    }

    useEffect(() => {
        if (mode === 'solo' && roomName) {
            if (gameStatus !== 'in-game') {
                requestStartGame();
            } else if (gameStatus === 'in-game') {
                navigate(`/${roomName}/${username}`);
            }
        }
    }, [mode, roomName, gameStatus, navigate, username]);
 
    return (
        <Wrapper>
            <BackButton onClick={() => navigate('/')} />
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
