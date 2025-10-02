import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Wrapper, Card, Subtitle, StartButton, LogoTitle, Input } from './HomePage.styled';
import BackButton from '../components/BackButton';
import { JoinForm, JoinHint } from './MultiplayerGamePage.styled';
import { resetGameState } from '../features/game/gameSlice';
import { showNotification } from '../features/notification/notificationSlice';
import { setGameMode } from '../features/game/gameSlice';
import { requestRoomJoin } from '../features/socket/socketThunks.js';

const MultiplayerGamePage = () => {
    const dispatch = useDispatch();
    const lobbySettings = useSelector((state) => state.game);
    const [roomName, setRoomName] = useState(() => lobbySettings.roomName || '');
    const navigate = useNavigate();

    const handleJoin = () => {
        const trimmed = roomName.trim();
        if (!trimmed) {
            dispatch(showNotification({ type: 'error', message: 'Enter a room name to join a lobby.' }));
            return;
        }

        requestRoomJoin({ roomName: trimmed }); // TODO: should not join the room if there are already 4 players
        dispatch(resetGameState());
        dispatch(setGameMode('multiplayer'));
        dispatch(showNotification({ type: 'success', message: `Joining lobby ${trimmed}…` }));
        navigate('/lobby');
    };

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

export default MultiplayerGamePage;
