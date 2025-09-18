import { useEffect, useState } from 'react';
import styled from 'styled-components';
import TetrisGrid from './TetrisGrid';
import { GameCard, Subtitle } from '../pages/HomePage.styled';
import { Row, SidePanel, PanelTitle, NextBox, ScoreBox } from '../pages/GamePage.styled';
import { useMockTetris } from '../hooks/useMockTetris';
import NextPiecePreview from './NextPiecePreview';

const computeCellSize = () => {
    if (typeof window === 'undefined') return 32;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const maxCellByWidth = (w * 0.64) / 10;
    const maxCellByHeight = (h * 0.72) / 20;
    const raw = Math.floor(Math.min(maxCellByWidth, maxCellByHeight));
    return Math.max(26, Math.min(raw, 46));
};

const SoloGameView = () => {
    const [cellSize, setCellSize] = useState(computeCellSize());

    useEffect(() => {
        const onResize = () => setCellSize(computeCellSize());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const {
        matrix,
        score,
        nextPieces,
        moveLeft,
        moveRight,
        rotateCW,
        rotateCCW,
        hardDrop,
        currentPiece,
        position,
        animateMs,
        clearingRows,
        clearAnimMs,
    } = useMockTetris({ rows: 20, cols: 10, speedMs: 650 });

    useEffect(() => {
        const onKeyDown = (e) => {
            const tag = e.target?.tagName?.toLowerCase();
            if (tag === 'input' || tag === 'textarea' || e.target?.isContentEditable) return;
            if (e.code === 'ArrowLeft') { e.preventDefault(); moveLeft(); }
            else if (e.code === 'ArrowRight') { e.preventDefault(); moveRight(); }
            else if (e.code === 'ArrowUp') { e.preventDefault(); rotateCW(); }
            else if (e.code === 'ArrowDown') { e.preventDefault(); rotateCCW(); }
            else if (e.code === 'Space') { e.preventDefault(); hardDrop(); }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [moveLeft, moveRight, rotateCW, rotateCCW, hardDrop]);

    return (
        <SoloCard>
            <Subtitle>ready to play</Subtitle>
            <Row>
                <TetrisGrid
                    rows={20}
                    cols={10}
                    cellSize={cellSize}
                    showGrid={true}
                    matrix={matrix}
                    activePiece={currentPiece}
                    activePos={position}
                    animateMs={animateMs}
                    clearingRows={clearingRows}
                    clearAnimMs={clearAnimMs}
                />
                <SidePanel>
                    <PanelTitle>Next</PanelTitle>
                    <NextBox>
                        <NextPiecePreview piece={nextPieces?.[0]} cellSize={Math.max(12, Math.floor(cellSize * 0.45))} />
                    </NextBox>
                    <PanelTitle style={{ marginTop: '0.5rem' }}>Score</PanelTitle>
                    <ScoreBox>{score}</ScoreBox>
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
