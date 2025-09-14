import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Wrapper,
    Glow,
    Title,
    Username,
    PlayerList,
    Player,
    StartButton,
} from './LobbyPage.styled';

const LobbyPage = () => {
    const username = useSelector((state) => state.user.username);
    const navigate = useNavigate();

    // Mocked players list — replace with real-time data later
    const players = [username, 'Player2', 'Player3'];

    const handleStartGame = () => {
        navigate('/game');
    };

    return (
        <Wrapper>
            <Glow className="top-right" />
            <Glow className="bottom-left" />

            <Title>Lobby</Title>
            <Username>Welcome, {username || 'Anonymous'}</Username>

            <PlayerList>
                {players.map((player, index) => (
                <Player key={index}>{player}</Player>
                ))}
            </PlayerList>

            <StartButton onClick={handleStartGame}>Start Game</StartButton>
        </Wrapper>
    );
};

export default LobbyPage;
