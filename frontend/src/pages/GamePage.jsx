import { useEffect, useState } from 'react';
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

    const handleReturnMenu = () => {
        setResultModalOpen(false);
        dispatch(setSpectatorActive(false));
        requestRoomLeave();
        navigate('/menu');
    };

    const handleSpectate = () => {
        dispatch(setSpectatorActive(true));
        setResultModalOpen(false);
    };

    const handleLeaveRoom = () => {
        dispatch(setSpectatorActive(false));
        requestRoomLeave();
    };

    const resultModalProps = {
        isOpen: isResultModalOpen,
        outcome: playerOutcome,
        onConfirm: handleReturnMenu,
        isOwner,
        canSpectate: Boolean(spectator?.eligible),
        onSpectate: handleSpectate,
    };

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
