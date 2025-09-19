import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Wrapper, Card, Subtitle, StartButton, LogoTitle } from './HomePage.styled';
import BackButton from '../components/BackButton';
import { PlayerList, Player } from './LobbyPage.styled';
import { showNotification } from '../features/notification/notificationSlice';
import { setGameMode } from '../features/game/gameSlice';
import { requestStartGame, requestRoomLeave } from '../features/socket/socketThunks';

const LobbyPage = () => {
    const username = useSelector((state) => state.user.username);
    const lobby = useSelector((state) => state.game);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const multiplayer = lobby.multiplayer;
    const players = multiplayer?.players?.length
        ? multiplayer.players.map((player) => player.username || player.id)
        : [username || 'You'];
    const you = lobby?.you?.username || username || 'You';
    const ownerId = lobby?.owner?.id;
    const isOwner = lobby?.you?.id && lobby.you.id === ownerId;

    const lobbyLabel = lobby?.roomName
        ? `Lobby name: ${lobby.roomName}`
        : isOwner
            ? `Hosting ${lobby.roomName ? `"${lobby.roomName}"` : 'a new lobby'}`
            : lobby.roomName
                ? `Joining lobby ${lobby.roomName}`
                : 'Lobby ready to connect';

    const maxSlots = lobby.maxPlayers || 4;

    const handleStartGame = () => {
        if (!isOwner) {
            dispatch(showNotification({ type: 'error', message: 'Only the lobby owner can start the game.' }));
            return;
        }
        dispatch(setGameMode('multiplayer'));
        dispatch(requestStartGame());
        dispatch(showNotification({ type: 'success', message: 'Starting game…' }));
        navigate('/game');
    };

    const handleLeaveLobby = () => {
        dispatch(requestRoomLeave());
        dispatch(showNotification({ type: 'info', message: 'Leaving lobby…' }));
        navigate('/menu');
    };

    return (
        <Wrapper>
            <BackButton onClick={handleLeaveLobby} />

            <LogoTitle>Lobby</LogoTitle>

            <Card>
                <Subtitle>Welcome, {you}</Subtitle>
                <Subtitle>{lobbyLabel}</Subtitle>
                <Subtitle>{`Slots: up to ${maxSlots} players`}</Subtitle>

                <PlayerList>
                    {players.map((player, index) => (
                        <Player key={index}>{player}</Player>
                    ))}
                </PlayerList>

                <StartButton onClick={handleStartGame} disabled={!isOwner}>
                    {isOwner ? 'Start Game' : 'Waiting for host'}
                </StartButton>
            </Card>
        </Wrapper>
    );
};

export default LobbyPage;
