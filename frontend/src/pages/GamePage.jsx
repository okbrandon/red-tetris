import { useDispatch, useSelector } from 'react-redux';
import BackButton from '../components/BackButton';
import GameView from '../components/GameView.jsx';
import { PageWrapper, SoloArena, GameLogoTitle } from './GamePage.styled';
import MultiplayerArena from '../components/MultiplayerArena';
import { requestRoomLeave } from '../features/socket/socketThunks.js';
import { useNavigate } from 'react-router-dom';
import { showNotification } from '../features/notification/notificationSlice';
import { useEffect } from 'react';
import { setGameStatus } from '../features/game/gameSlice';


const GamePage = () => {
    const { mode, gameStatus, grid } = useSelector((state) => state.game);
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
                ? <MultiplayerArena grid={grid} />
                : (
                    <SoloArena>
                        <GameView grid={grid} />
                    </SoloArena>
                )}
        </PageWrapper>
    );
};

export default GamePage;
