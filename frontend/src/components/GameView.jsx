import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import TetrisGrid from './TetrisGrid.jsx';
import { Subtitle } from '../pages/HomePage.styled.js';
import NextPiecePreview from './NextPiecePreview.jsx';
import { requestPieceMove } from '../features/socket/socketThunks.js';
import { extractMoveDirection, shouldIgnoreForGameControls } from '../utils/keyboard.js';

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

const normalizePiece = (piece) => {
    if (!piece || typeof piece !== 'object' || !Array.isArray(piece.shape)) return null;
    return {
        ...piece,
        position: piece.position ?? { x: 0, y: 0 },
    };
};

const GameView = () => {
    const { grid, currentPiece, nextPieces, score } = useSelector((state) => state.game);

    const board = useMemo(() => (Array.isArray(grid) ? grid : []), [grid]);
    const rows = board.length || 20;
    const cols = board[0]?.length || 10;
    const normalizedPiece = useMemo(() => normalizePiece(currentPiece), [currentPiece]);
    const queue = useMemo(() => (
        Array.isArray(nextPieces) && nextPieces.length ? nextPieces : []
    ), [nextPieces]);

    const [cellSize, setCellSize] = useState(() => computeCellSize(rows, cols));

    useEffect(() => {
        setCellSize(computeCellSize(rows, cols));
    }, [rows, cols]);

    useEffect(() => {
        const onResize = () => setCellSize(computeCellSize(rows, cols));
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', onResize);
            return () => window.removeEventListener('resize', onResize);
        }
        return () => {};
    }, [rows, cols]);

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

    const primaryPreviewSize = useMemo(() => Math.max(16, Math.floor(cellSize * 0.6)), [cellSize]);
    const queuePreviewSize = useMemo(() => Math.max(14, Math.floor(cellSize * 0.48)), [cellSize]);

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
                        currentPiece={normalizedPiece}
                    />
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

const Layout = styled.div`
    width: fit-content;
    height: 100%;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
        'board'
        'panel';
    gap: clamp(0.9rem, 2.4vw, 1.6rem);
    border-radius: 20px;
    border: 1px solid rgba(142, 107, 225, 0.26);
    background: linear-gradient(160deg, rgba(26, 22, 45, 0.88), rgba(13, 11, 24, 0.96));
    box-shadow: 0 24px 46px rgba(8, 5, 18, 0.52);
    padding: clamp(1.1rem, 3vw, 2rem) 100px;
    box-sizing: border-box;

    @media (min-width: 920px) {
        grid-template-columns: minmax(0, 1fr) clamp(220px, 24vw, 280px);
        grid-template-areas: 'board panel';
        align-items: stretch;
    }
`;

const BoardArea = styled.section`
    grid-area: board;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const BoardFrame = styled.div`
    padding: clamp(0.6rem, 1.4vw, 1rem);
    border-radius: 18px;
    border: 1px solid rgba(162, 130, 235, 0.25);
    background: rgba(18, 15, 32, 0.84);
    box-shadow: inset 0 1px 0 rgba(217, 206, 255, 0.12);
`;

const PanelArea = styled.section`
    grid-area: panel;
    display: flex;
    flex-direction: column;
    gap: clamp(0.7rem, 2vw, 1.2rem);
    align-items: stretch;
    justify-content: flex-start;
`;

const PanelHeading = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
`;

const PanelCaption = styled.p`
    margin: 0;
    font-size: 0.8rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(215, 206, 246, 0.68);
`;

const InfoCard = styled.div`
    border-radius: 14px;
    border: 1px solid rgba(162, 130, 235, 0.22);
    background: rgba(21, 18, 36, 0.72);
    box-shadow: 0 14px 28px rgba(10, 7, 20, 0.3);
    padding: clamp(0.8rem, 2vw, 1.1rem);
    display: flex;
    flex-direction: column;
    gap: clamp(0.6rem, 1.6vw, 0.9rem);
`;

const InfoLabel = styled.span`
    font-size: 0.68rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: rgba(199, 191, 234, 0.72);
`;

const ScoreValue = styled.span`
    font-size: clamp(1.4rem, 2.6vw, 1.9rem);
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #f6f1ff;
`;

const VerticalPreview = styled.div`
    display: flex;
    flex-direction: column;
    gap: clamp(0.5rem, 1.2vw, 0.8rem);
    width: 100%;
`;

const PreviewSlot = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: clamp(64px, 10vw, 96px);
    width: 100%;
    padding: 0.2rem 0;
`;

const EmptyQueue = styled.p`
    margin: 0;
    font-size: 0.74rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(199, 191, 234, 0.58);
`;
