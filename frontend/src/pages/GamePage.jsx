import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { LogoTitle } from './HomePage.styled';
import BackButton from '../components/BackButton';
import SoloGameView from '../components/SoloGameView';
import { PageWrapper } from './GamePage.styled';
import MultiplayerArena from '../components/MultiplayerArena';
import { requestRoomLeave } from '../features/socket/socketThunks';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../features/notification/notificationSlice';
import { useEffect } from 'react';

const GamePage = () => {
    const { mode } = useSelector((state) => state.game);
    const gameStatus = useSelector((state) => state.game.gameStatus);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isMultiplayer = mode === 'multiplayer';

    const handleLeaveGame = () => {
        dispatch(requestRoomLeave());
        dispatch(showNotification({ type: 'info', message: 'Leaving game…' }));
        navigate('/menu');
    }

    useEffect(() => {
        console.log('Game status on GamePage:', gameStatus);
        if (gameStatus && gameStatus === 'game-over') {
            dispatch(showNotification({ type: 'info', message: 'The game has ended. Returning to menu.' }));
            dispatch(requestRoomLeave());
            navigate('/menu');
        }
    }, [gameStatus]);

    return (
        <PageWrapper>
            <BackButton onClick={handleLeaveGame} />
            <GameLogoTitle>{isMultiplayer ? 'Multiplayer' : 'Game'}</GameLogoTitle>
            {isMultiplayer
                ? <MultiplayerArena />
                : <SoloGameView />}
        </PageWrapper>
    );
};

const GameLogoTitle = styled(LogoTitle)`
    font-size: clamp(2.1rem, 4vw, 2.8rem);
    margin-bottom: clamp(0.5rem, 1.8vh, 1.2rem);
`;

export default GamePage;
