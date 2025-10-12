import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import GameView from '../components/GameView.jsx';
import { PageWrapper, SoloArena, GameLogoTitle } from './GamePage.styled';
import MultiplayerArena from '../components/MultiplayerArena';
import { requestRoomLeave } from '../features/socket/socketThunks.js';
import LobbyPage from  './LobbyPage.jsx';
import { setSpectatorActive } from '../features/game/gameSlice.js';


const GamePage = () => {
    const { mode, gameStatus, grid, playerOutcome, isOwner, spectator } = useSelector((state) => state.game);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isResultModalOpen, setResultModalOpen] = useState(false);

    const isMultiplayer = mode === 'multiplayer';

    const hasOutcome = Boolean(playerOutcome && playerOutcome.outcome);

    useEffect(() => {
        if (gameStatus === 'game-over' || (gameStatus === 'in-game' && hasOutcome)) {
            setResultModalOpen(true);
        }
    }, [gameStatus, hasOutcome]);

    useEffect(() => {
        if (gameStatus === 'in-game' && !hasOutcome && isResultModalOpen) {
            setResultModalOpen(false);
        }
    }, [gameStatus, hasOutcome, isResultModalOpen]);

    useEffect(() => {
        if (!gameStatus) {
            navigate('/menu');
        }
    }, [gameStatus, navigate]);

    const handleReturnMenu = useCallback(() => {
        setResultModalOpen(false);
        dispatch(setSpectatorActive(false));
        requestRoomLeave();
        navigate('/menu');
    }, [dispatch, navigate]);

    const handleSpectate = useCallback(() => {
        dispatch(setSpectatorActive(true));
        setResultModalOpen(false);
    }, [dispatch]);

    const handleLeaveRoom = useCallback(() => {
        dispatch(setSpectatorActive(false));
        requestRoomLeave();
    }, [dispatch]);

    const resultModalProps = useMemo(() => ({
        isOpen: isResultModalOpen,
        outcome: playerOutcome,
        onConfirm: handleReturnMenu,
        isOwner,
        canSpectate: Boolean(spectator?.eligible),
        onSpectate: handleSpectate,
        isGameOver: gameStatus === 'game-over',
    }), [isResultModalOpen, playerOutcome, handleReturnMenu, isOwner, spectator, gameStatus]);

    return (
        gameStatus === 'waiting' || !grid[0].length ? (
            <LobbyPage />
        ) : (
            <PageWrapper>
                <BackButton onClick={handleLeaveRoom} />
                <GameLogoTitle>{isMultiplayer ? 'Multiplayer' : 'Game'}</GameLogoTitle>
                {isMultiplayer
                    ? (
                        <MultiplayerArena
                            grid={grid}
                            resultModal={resultModalProps}
                            showSpectators={Boolean(spectator?.active)}
                            onExitSpectators={() => dispatch(setSpectatorActive(false))}
                        />
                    )
                    : (
                        <SoloArena>
                            <GameView grid={grid} resultModal={resultModalProps} />
                        </SoloArena>
                    )}
            </PageWrapper>
        )
    );
};

export default GamePage;
