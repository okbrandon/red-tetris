import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Wrapper, Card, Subtitle, StartButton, LogoTitle, Input } from './HomePage.styled.js';
import BackButton from '../components/BackButton.jsx';
import { JoinForm, JoinHint } from './JoinPage.styled';
import { showNotification } from '../features/notification/notificationSlice.js';
import { requestRoomJoin } from '../features/socket/socketThunks.js';

const JoinPage = () => {
    const dispatch = useDispatch();
    const lobbySettings = useSelector((state) => state.game);
    const { username } = useSelector((state) => state.user);
    const [roomName, setRoomName] = useState(() => lobbySettings.roomName || '');
    const navigate = useNavigate();

    const handleJoin = () => {
        const trimmed = roomName.trim();
        if (!trimmed) {
            dispatch(showNotification({ type: 'error', message: 'Enter a room name to join a lobby.' }));
            return;
        }
        requestRoomJoin({ roomName: trimmed, soloJourney: false });
        dispatch(showNotification({ type: 'success', message: `Joining lobby ${trimmed}…` }));
    };
    // Brandon will add to room-joined `soloJourney: Boolean` in the payload
    // for the moment my logic is not working but should when that is done.
    useEffect(() => {
        if (lobbySettings.mode === 'multiplayer' && lobbySettings.roomName) {
            navigate(`/${lobbySettings.roomName}/${username}`);
        }
    }, [lobbySettings.mode, lobbySettings.roomName, username, navigate]);

    return (
        <Wrapper>
            <BackButton onClick={() => navigate('/menu')} />
            <LogoTitle>Multiplayer</LogoTitle>
            <Card>
                <Subtitle>Enter a room name</Subtitle>
                <JoinForm>
                    <Input
                        type='text'
                        value={roomName}
                        placeholder='Enter room name'
                        aria-label='Room name'
                        onChange={(event) => setRoomName(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && roomName.trim()) handleJoin();
                        }}
                    />
                    <StartButton onClick={handleJoin} disabled={!roomName.trim()}>
                        Join Lobby
                    </StartButton>
                    <JoinHint>Join an existing room or create a new one.</JoinHint>
                </JoinForm>
            </Card>
        </Wrapper>
    );
};

export default JoinPage;
