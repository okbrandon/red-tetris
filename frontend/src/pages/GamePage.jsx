import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import BackButton from '../components/BackButton';
import GameView from '../components/GameView.jsx';
import { PageWrapper, SoloArena, GameLogoTitle } from './GamePage.styled';
import MultiplayerArena from '../components/MultiplayerArena';
import { requestRoomLeave } from '../features/socket/socketThunks.js';
import GameResultModal from '../components/GameResultModal.jsx';
import LobbyPage from  './LobbyPage.jsx';


const GamePage = () => {
    const { room, player_name: playerName } = useParams();
    const { mode, gameStatus, grid, gameResult, isOwner } = useSelector((state) => state.game);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isResultModalOpen, setResultModalOpen] = useState(false);

    const isMultiplayer = mode === 'multiplayer';
    const resultOutcome = gameResult?.outcome ?? 'info';

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

    return (
        gameStatus === 'waiting' || !grid[0].length ? (
            <LobbyPage />
        ) : (
            <PageWrapper>
                <BackButton onClick={() => requestRoomLeave() } />
                <GameLogoTitle>{isMultiplayer ? 'Multiplayer' : 'Game'}</GameLogoTitle>
                {isMultiplayer
                    ? <MultiplayerArena grid={grid} />
                    : (
                        <SoloArena>
                            <GameView grid={grid} />
                        </SoloArena>
                    )}
                <GameResultModal
                    isOpen={isResultModalOpen}
                    outcome={resultOutcome}
                    onConfirm={handleReturnMenu}
                    isOwner={isOwner}
                />
            </PageWrapper>
        )
    );
};

export default GamePage;
