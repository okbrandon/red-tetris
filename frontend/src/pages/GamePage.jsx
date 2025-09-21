import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { LogoTitle } from './HomePage.styled';
import BackButton from '../components/BackButton';
import GameView from '../components/GameView.jsx';
import { PageWrapper } from './GamePage.styled';
import MultiplayerArena from '../components/MultiplayerArena';
import { requestRoomLeave } from '../features/socket/socketThunks.js';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../features/notification/notificationSlice';
import { useEffect } from 'react';
import { setGameStatus } from '../features/game/gameSlice';

const GamePage = () => {
    const { mode } = useSelector((state) => state.game);
    const gameStatus = useSelector((state) => state.game.gameStatus);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isMultiplayer = mode === 'multiplayer';

    const handleLeaveGame = () => {
        dispatch(setGameStatus({ room: { status: 'game-over' } }));
    }

    useEffect(() => {
        if (gameStatus && gameStatus === 'game-over') {
            dispatch(showNotification({ type: 'info', message: 'The game has ended. Returning to menu.' }));
            requestRoomLeave();
            navigate('/menu');
        }
    }, [dispatch, gameStatus, navigate]);

    return (
        <PageWrapper>
            <BackButton onClick={handleLeaveGame} />
            <GameLogoTitle>{isMultiplayer ? 'Multiplayer' : 'Game'}</GameLogoTitle>
            {isMultiplayer
                ? <MultiplayerArena />
                : (
                    <SoloArena>
                        <GameView />
                    </SoloArena>
                )}
        </PageWrapper>
    );
};

const SoloArena = styled.div`
    width: min(96vw, 1040px);
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    padding: clamp(0.8rem, 3vw, 1.6rem);
    box-sizing: border-box;
`;

const GameLogoTitle = styled(LogoTitle)`
    font-size: clamp(2.1rem, 4vw, 2.8rem);
    margin-bottom: clamp(0.5rem, 1.8vh, 1.2rem);
`;

export default GamePage;
