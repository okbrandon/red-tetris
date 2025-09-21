import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Wrapper, Card, Subtitle, StartButton, LogoTitle } from './HomePage.styled';
import BackButton from '../components/BackButton';
import { PlayerList, Player } from './LobbyPage.styled';
import { showNotification } from '../features/notification/notificationSlice';
import { requestRoomLeave, requestStartGame } from '../features/socket/socketThunks.js';
import { useEffect } from 'react';
import { resetGameState } from '../features/game/gameSlice.js';

const LobbyPage = () => {
    const username = useSelector((state) => state.user.username);
    const game = useSelector((state) => state.game);
    const gameStatus = useSelector((state) => state.game.gameStatus);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const multiplayer = game.multiplayer;
    const players = multiplayer?.players?.length
        ? multiplayer.players.map((player) => player.username || player.id)
        : [username || 'You'];
    const you = game?.you?.username || username || 'You';
    const ownerId = game?.owner?.id;
    const isOwner = game?.you?.id && game.you.id === ownerId;

    const lobbyLabel = game?.roomName
        ? `Lobby name: ${game.roomName}`
        : isOwner
            ? `Hosting ${game.roomName ? `"${game.roomName}"` : 'a new lobby'}`
            : game.roomName
                ? `Joining lobby ${game.roomName}`
                : 'Lobby ready to connect';

    const maxSlots = game.maxPlayers || 4;

    const handleStartGame = () => {
        if (!isOwner) {
            dispatch(showNotification({ type: 'error', message: 'Only the lobby owner can start the game.' }));
            return;
        }
        requestStartGame();
    };

    const handleLeaveLobby = () => {
        requestRoomLeave();
        dispatch(resetGameState());
        dispatch(showNotification({ type: 'info', message: 'Leaving lobby…' }));
        navigate('/menu');
    };

    useEffect(() => {
        if (gameStatus && gameStatus === 'in-game')
            navigate('/game');
    }, [gameStatus, navigate]);

    useEffect(() => {
        console.log('Game state on LobbyPage:', game);
    }, [game]);

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
