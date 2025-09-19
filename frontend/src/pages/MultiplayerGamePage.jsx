import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Wrapper, Card, Subtitle, StartButton, LogoTitle, Input } from './HomePage.styled';
import BackButton from '../components/BackButton';
import { JoinForm, JoinHint } from './MultiplayerGamePage.styled';
import { setLobbySettings, resetLobby } from '../features/lobby/lobbySlice';
import { showNotification } from '../features/notification/notificationSlice';
import { setGameMode } from '../features/game/gameSlice';
import { requestRoomJoin } from '../features/socket/socketThunks';

const MultiplayerGamePage = () => {
    const dispatch = useDispatch();
    const lobbySettings = useSelector((state) => state.lobby);
    const [roomName, setRoomName] = useState(() => lobbySettings.roomName || '');
    const navigate = useNavigate();

    const handleJoin = () => {
        const trimmed = roomName.trim();
        if (!trimmed) {
            dispatch(showNotification({ type: 'error', message: 'Enter a room code to join a lobby.' }));
            return;
        }

        dispatch(requestRoomJoin({ roomName: trimmed })); // TODO: should not join the room if there are already 4 players
        dispatch(resetLobby());
        dispatch(setLobbySettings({
            host: false, // TODO: to change
            roomName: trimmed,
        }));
        dispatch(setGameMode('multiplayer'));
        dispatch(showNotification({ type: 'success', message: `Joining lobby ${trimmed}…` }));
        navigate('/lobby');
    };

    return (
        <Wrapper>
            <BackButton />
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
