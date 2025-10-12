import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import GameView from '../components/GameView.jsx';
import { PageWrapper, SoloArena, GameLogoTitle } from './GamePage.styled';
import MultiplayerArena from '../components/MultiplayerArena';
import { requestRoomLeave } from '../features/socket/socketThunks.js';
import LobbyPage from  './LobbyPage.jsx';


const GamePage = () => {
    const { room, player_name: playerName } = useParams();
    const { mode, gameStatus, grid, playerOutcome, isOwner } = useSelector((state) => state.game);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isResultModalOpen, setResultModalOpen] = useState(false);

    const isMultiplayer = mode === 'multiplayer';

    useEffect(() => {
        if (gameStatus !== 'game-over') {
            return;
        }

        setResultModalOpen(true);
    }, [dispatch, gameStatus, isMultiplayer, navigate]);

    useEffect(() => {
        if (gameStatus !== 'game-over' && isResultModalOpen) {
            setResultModalOpen(false);
        }
    }, [gameStatus, isResultModalOpen]);

    useEffect(() => {
        if (!gameStatus) {
            navigate('/menu');
        }
    }, [gameStatus, navigate]);

    const handleReturnMenu = () => {
        setResultModalOpen(false);
        requestRoomLeave();
        navigate('/menu');
    };

    const resultModalProps = {
        isOpen: isResultModalOpen,
        outcome: playerOutcome,
        onConfirm: handleReturnMenu,
        isOwner,
    };

    return (
        gameStatus === 'waiting' || !grid[0].length ? (
            <LobbyPage />
        ) : (
            <PageWrapper>
                <BackButton onClick={() => requestRoomLeave() } />
                <GameLogoTitle>{isMultiplayer ? 'Multiplayer' : 'Game'}</GameLogoTitle>
                {isMultiplayer
                    ? <MultiplayerArena grid={grid} resultModal={resultModalProps} />
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
