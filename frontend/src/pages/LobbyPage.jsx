import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Wrapper, Card, Subtitle, StartButton, LogoTitle } from './HomePage.styled';
import BackButton from '../components/BackButton';
import { PlayerList, Player } from './LobbyPage.styled';
import { showNotification } from '../features/notification/notificationSlice';
import { requestRoomLeave, requestStartGame } from '../features/socket/socketThunks.js';

const LobbyPage = () => {
    const { username, id } = useSelector((state) => state.user);
    const game = useSelector((state) => state.game);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const players = game.players?.length
        ? game.players.map((player) => player.username || player.id)
        : [username || 'You'];
    const ownerId = game?.owner?.id;
    const isOwner = id === ownerId;

    const lobbyLabel = game?.roomName
        ? `Lobby name: ${game.roomName}`
        : isOwner
            ? `Hosting ${game.roomName ? `"${game.roomName}"` : 'a new lobby'}`
            : game.roomName
                ? `Joining lobby ${game.roomName}`
                : 'Lobby ready to connect';

    const handleStartGame = () => {
        if (!isOwner) {
            dispatch(showNotification({ type: 'error', message: 'Only the lobby owner can start the game.' }));
            return;
        }
        requestStartGame();
    };

    const handleLeaveLobby = () => {
        requestRoomLeave();
        dispatch(showNotification({ type: 'info', message: 'Leaving lobby…' }));
        navigate('/menu');
    };

    return (
        <Wrapper>
            <BackButton onClick={handleLeaveLobby} />

            <LogoTitle>Lobby</LogoTitle>

            <Card>
                <Subtitle>Welcome, {username}</Subtitle>
                <Subtitle>{lobbyLabel}</Subtitle>
                <Subtitle>{`Slots: up to 4 players`}</Subtitle>

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
