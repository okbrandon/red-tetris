import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Wrapper, Card, Subtitle, StartButton, LogoTitle } from './HomePage.styled';
import BackButton from '../components/BackButton';
import { PlayerList, Player } from './LobbyPage.styled';
import { showNotification } from '../features/notification/notificationSlice';

const LobbyPage = () => {
    const username = useSelector((state) => state.user.username);
    const lobby = useSelector((state) => state.lobby);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Mocked players list — replace with real-time data later
    const maxSlots = lobby.maxPlayers || 4;
    const players = [username || 'You', 'Player2', 'Player3'].slice(0, maxSlots);

    const lobbyLabel = lobby.host
        ? `Hosting ${lobby.roomName ? `"${lobby.roomName}"` : 'a new lobby'}`
        : lobby.roomCode
            ? `Joining lobby ${lobby.roomCode}`
            : 'Lobby ready to connect';

    const privacyLabel = lobby.isPrivate ? 'Private' : 'Public';

    const handleStartGame = () => {
        dispatch(showNotification({ type: 'success', message: 'Starting game…' }));
        navigate('/game');
    };

    return (
        <Wrapper>
            <BackButton />

            <LogoTitle>Lobby</LogoTitle>

            <Card>
                <Subtitle>Welcome, {username || 'Anonymous'}</Subtitle>
                <Subtitle>{lobbyLabel}</Subtitle>
                <Subtitle>{`Slots: up to ${maxSlots} players · ${privacyLabel}`}</Subtitle>

                <PlayerList>
                    {players.map((player, index) => (
                        <Player key={index}>{player}</Player>
                    ))}
                </PlayerList>

                <StartButton onClick={handleStartGame}>Start Game</StartButton>
            </Card>
        </Wrapper>
    );
};

export default LobbyPage;
