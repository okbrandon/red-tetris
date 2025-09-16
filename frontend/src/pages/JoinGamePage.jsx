import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrapper, Card, Subtitle, StartButton, LogoTitle, Input } from './HomePage.styled';
import BackButton from '../components/BackButton';
import { JoinForm, JoinHint } from './JoinGamePage.styled';

const JoinGamePage = () => {
    const [roomCode, setRoomCode] = useState('');
    const navigate = useNavigate();

    const handleJoin = () => {
        if (!roomCode.trim()) return;
        // TODO: replace with real join flow once backend is ready
        navigate('/lobby', { state: { roomCode: roomCode.trim() } });
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
