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
    const { mode, gameStatus, grid, gameResult } = useSelector((state) => state.game);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isResultModalOpen, setResultModalOpen] = useState(false);

    const isMultiplayer = mode === 'multiplayer';
    const resultOutcome = gameResult?.outcome ?? 'info';

    const handleLeaveGame = () => {
        requestRoomLeave();
        navigate('/menu');
    };

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

    const handleResultConfirm = () => {
        setResultModalOpen(false);
        requestRoomLeave();
        navigate('/menu');
    };

    return (
        gameStatus === 'waiting' ? (
            <LobbyPage />
        ) : (
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
                <GameResultModal
                    isOpen={isResultModalOpen}
                    outcome={resultOutcome}
                    onConfirm={handleResultConfirm}
                />
            </PageWrapper>
        )
    );
};

export default GamePage;
