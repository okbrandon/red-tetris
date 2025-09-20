import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import TetrisGrid from './TetrisGrid';
import { GameCard, Subtitle } from '../pages/HomePage.styled';
import { Row, SidePanel, PanelTitle, NextBox, ScoreBox } from '../pages/GamePage.styled';
import NextPiecePreview from './NextPiecePreview';

const computeCellSize = (rows = 20, cols = 10) => {
    if (typeof window === 'undefined') return 32;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxCellByWidth = (w * 0.64) / cols;
    const maxCellByHeight = (h * 0.72) / rows;
    const raw = Math.floor(Math.min(maxCellByWidth, maxCellByHeight));
    return Math.max(26, Math.min(raw, 46));
};

const normalizePiece = (piece) => {
    if (!piece || typeof piece !== 'object' || !Array.isArray(piece.shape)) return null;
    return {
        ...piece,
        position: piece.position ?? { x: 0, y: 0 },
    };
};

const SoloGameView = () => {
    const { grid, currentPiece, nextPieces, score } = useSelector((state) => state.game);

    const board = useMemo(() => (Array.isArray(grid) ? grid : []), [grid]);
    const rows = board.length || 20;
    const cols = board[0]?.length || 10;
    const normalizedPiece = useMemo(() => normalizePiece(currentPiece), [currentPiece]);

    const [cellSize, setCellSize] = useState(() => computeCellSize(rows, cols));

    useEffect(() => {
        setCellSize(computeCellSize(rows, cols));
    }, [rows, cols]);

    useEffect(() => {
        const onResize = () => setCellSize(computeCellSize(rows, cols));
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [rows, cols]);

    return (
        <SoloCard>
            <Subtitle>ready to play</Subtitle>
            <Row>
                <TetrisGrid
                    rows={rows}
                    cols={cols}
                    cellSize={cellSize}
                    showGrid
                    grid={board}
                    currentPiece={normalizedPiece}
                />
                <SidePanel>
                    <PanelTitle>Next</PanelTitle>
                    <NextBox>
                        <NextPiecePreview piece={nextPieces?.[0]} cellSize={Math.max(12, Math.floor(cellSize * 0.45))} />
                    </NextBox>
                    <PanelTitle style={{ marginTop: '0.5rem' }}>Score</PanelTitle>
                    <ScoreBox>{score ?? 0}</ScoreBox>
                </SidePanel>
            </Row>
        </SoloCard>
    );
};

export default SoloGameView;

const SoloCard = styled(GameCard)`
    width: min(90vw, 980px);
    height: clamp(420px, calc(100vh - 8.5rem), 660px);
    max-height: calc(100vh - 7rem);
    padding: clamp(1.2rem, 2.6vh, 1.65rem);
    gap: clamp(0.9rem, 2vh, 1.35rem);
    overflow: hidden;
    box-sizing: border-box;
`;
