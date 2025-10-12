import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import TetrisGrid from './TetrisGrid.jsx';
import { Subtitle } from '../pages/HomePage.styled.js';
import NextPiecePreview from './NextPiecePreview.jsx';
import { requestPieceMove } from '../features/socket/socketThunks.js';
import { extractMoveDirection, shouldIgnoreForGameControls } from '../utils/keyboard.js';
import useResponsiveValue from '../hooks/useResponsiveValue.js';
import { deriveBoardDimensions } from '../utils/tetris.js';
import GameResultModal from './GameResultModal.jsx';
import {
    Layout,
    BoardArea,
    BoardFrame,
    PanelArea,
    PanelHeading,
    PanelCaption,
    InfoCard,
    InfoLabel,
    ScoreValue,
    VerticalPreview,
    PreviewSlot,
    EmptyQueue,
} from './GameView.styled.js';

const computeCellSize = (rows = 20, cols = 10) => {
    if (typeof window === 'undefined') return 32;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const panelWidth = w >= 920 ? Math.min(Math.max(w * 0.26, 220), 320) : 0;
    const padding = w >= 920 ? 120 : 80;
    const availableWidth = Math.max(w - panelWidth - padding, 240);
    const maxCellByWidth = availableWidth / cols;
    const availableHeight = Math.max(h - 260, 360);
    const maxCellByHeight = availableHeight / rows;
    const raw = Math.floor(Math.min(maxCellByWidth, maxCellByHeight));
    return Math.max(22, Math.min(raw, 44));
};

const GameView = ({ grid, resultModal }) => {
    const { currentPiece, nextPieces, score } = useSelector((state) => state.game);

    const board = Array.isArray(grid) ? grid : [];
    const { rows, cols } = deriveBoardDimensions(board);
    const queue = Array.isArray(nextPieces) ? nextPieces : [];

    const cellSize = useResponsiveValue(useCallback(() => computeCellSize(rows, cols), [rows, cols]));

    useEffect(() => {
        if (typeof window === 'undefined') return () => {};

        const handleKeyDown = (event) => {
            if (!event || shouldIgnoreForGameControls(event.target)) return;

            const direction = extractMoveDirection(event);
            if (!direction) return;

            event.preventDefault();
            requestPieceMove({ direction });
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    const primaryPreviewSize = Math.max(16, Math.floor(cellSize * 0.6));
    const queuePreviewSize = Math.max(14, Math.floor(cellSize * 0.48));
    const modalConfig = resultModal ?? {};
    const shouldShowResult = Boolean(modalConfig.isOpen && typeof modalConfig.onConfirm === 'function');

    useEffect(() => {
        console.log('modalConfig changed:', modalConfig);
    }, [modalConfig]);

    return (
        <Layout>
            <BoardArea>
                <BoardFrame>
                    <TetrisGrid
                        rows={rows}
                        cols={cols}
                        cellSize={cellSize}
                        showGrid
                        grid={board}
                        currentPiece={currentPiece}
                    />
                    {shouldShowResult && (
                        <GameResultModal
                            isOpen={modalConfig.isOpen}
                            outcome={modalConfig.outcome}
                            onConfirm={modalConfig.onConfirm}
                            isOwner={Boolean(modalConfig.isOwner)}
                            canSpectate={Boolean(modalConfig.canSpectate)}
                            onSpectate={modalConfig.onSpectate}
                            placement='board'
                        />
                    )}
                </BoardFrame>
            </BoardArea>
            <PanelArea>
                <PanelHeading>
                    <Subtitle as='h2' style={{ margin: 0 }}>Solo Journey</Subtitle>
                    <PanelCaption>Stay sharp, stack the neon skyline.</PanelCaption>
                </PanelHeading>

                <InfoCard aria-label='Score overview'>
                    <InfoLabel>Score</InfoLabel>
                    <ScoreValue>{score ?? 0}</ScoreValue>
                </InfoCard>

                <InfoCard aria-label='Upcoming pieces'>
                    <InfoLabel>Next Pieces</InfoLabel>
                    {queue.length ? (
                        <VerticalPreview>
                            {queue.slice(0, 3).map((piece, index) => (
                                <PreviewSlot key={piece?.id ?? piece?.name ?? `next-${index}`}>
                                    <NextPiecePreview
                                        piece={piece}
                                        cellSize={index === 0 ? primaryPreviewSize : queuePreviewSize}
                                    />
                                </PreviewSlot>
                            ))}
                        </VerticalPreview>
                    ) : (
                        <EmptyQueue>No preview available</EmptyQueue>
                    )}
                </InfoCard>
            </PanelArea>
        </Layout>
    );
};

export default GameView;
