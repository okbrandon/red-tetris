import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Wrapper, Card, Subtitle, StartButton, LogoTitle, Input } from './HomePage.styled';
import BackButton from '../components/BackButton';
import { JoinForm, JoinHint } from './JoinGamePage.styled';
import { setLobbySettings, resetLobby } from '../features/lobby/lobbySlice';

const JoinGamePage = () => {
    const dispatch = useDispatch();
    const lobbySettings = useSelector((state) => state.lobby);
    const [roomCode, setRoomCode] = useState(() => lobbySettings.roomCode || '');
    const navigate = useNavigate();

    const handleJoin = () => {
        if (!roomCode.trim()) return;
        // TODO: replace with real join flow once backend is ready
        const trimmed = roomCode.trim();
        dispatch(resetLobby());
        dispatch(setLobbySettings({
            host: false,
            roomCode: trimmed,
        }));
        navigate('/lobby');
    };

    return (
        <Wrapper>
            <BackButton />
            <LogoTitle>Join Game</LogoTitle>
            <Card>
                <Subtitle>Enter the invite code to join your friends.</Subtitle>
                <JoinForm>
                    <Input
                        type='text'
                        value={roomCode}
                        placeholder='Enter room code'
                        aria-label='Room code'
                        onChange={(event) => setRoomCode(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' && roomCode.trim()) handleJoin();
                        }}
                    />
                    <StartButton onClick={handleJoin} disabled={!roomCode.trim()}>
                        Join Lobby
                    </StartButton>
                    <JoinHint>Room creators can share the code once their lobby is ready.</JoinHint>
                </JoinForm>
            </Card>
        </Wrapper>
    );
};

export default JoinGamePage;
