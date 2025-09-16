import { useEffect, useState } from 'react';
import TetrisGrid from '../components/TetrisGrid';
import { Wrapper, Subtitle, LogoTitle, GameCard } from './HomePage.styled';
import { Row, SidePanel, PanelTitle, NextBox, ScoreBox } from './GamePage.styled';
import { useMockTetris } from '../hooks/useMockTetris'; // to remove after backend integration
import NextPiecePreview from '../components/NextPiecePreview';
import BackButton from '../components/BackButton';

const GamePage = () => {
    const computeCellSize = () => {
        if (typeof window === 'undefined') return 30;
        const w = window.innerWidth;
        const h = window.innerHeight;
        // Conservative sizing to avoid overflow on typical viewports
        const maxCellByWidth = (w * 0.55) / 10;  // ~55% of viewport width
        const maxCellByHeight = (h * 0.65) / 20; // ~65% of viewport height
        const raw = Math.floor(Math.min(maxCellByWidth, maxCellByHeight));
        // Reasonable cap to prevent stretching on large screens
        return Math.max(22, Math.min(raw, 44));
    };

    const [cellSize, setCellSize] = useState(computeCellSize());
    useEffect(() => {
        const onResize = () => setCellSize(computeCellSize());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const { matrix, score, nextPieces, moveLeft, moveRight, rotateCW, rotateCCW, hardDrop, currentPiece, position, animateMs, clearingRows, clearAnimMs } = useMockTetris({ rows: 20, cols: 10, speedMs: 650 });

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
        <Wrapper>
            <BackButton />
            <LogoTitle>Game</LogoTitle>
            <GameCard>
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
                    {/* Placeholder for next/score panel */}
                    <SidePanel>
                        <PanelTitle>Next</PanelTitle>
                        <NextBox>
                            <NextPiecePreview piece={nextPieces?.[0]} cellSize={Math.max(12, Math.floor(cellSize * 0.6))} />
                        </NextBox>
                        <PanelTitle style={{ marginTop: '0.5rem' }}>Score</PanelTitle>
                        <ScoreBox>{score}</ScoreBox>
                    </SidePanel>
                </Row>
            </GameCard>
        </Wrapper>
    );
};

export default GamePage;
