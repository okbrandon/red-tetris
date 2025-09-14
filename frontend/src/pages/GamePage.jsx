import { useEffect, useState } from 'react';
import TetrisGrid from '../components/TetrisGrid';
import { Wrapper, Subtitle, LogoTitle, GameCard } from './HomePage.styled';
import { Row, SidePanel, PanelTitle, NextBox, ScoreBox } from './GamePage.styled';

const GamePage = () => {
    const computeCellSize = () => {
        if (typeof window === 'undefined') return 30;
        const w = window.innerWidth;
        const h = window.innerHeight;
        // Conservative sizing to avoid overflow on typical viewports
        const maxCellByWidth = (w * 0.6) / 10;  // ~60% of viewport width
        const maxCellByHeight = (h * 0.75) / 20; // ~75% of viewport height
        const raw = Math.floor(Math.min(maxCellByWidth, maxCellByHeight));
        // Reasonable cap to prevent stretching on large screens
        return Math.max(24, Math.min(raw, 48));
    };

    const [cellSize, setCellSize] = useState(computeCellSize());
    useEffect(() => {
        const onResize = () => setCellSize(computeCellSize());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return (
        <Wrapper>
            <LogoTitle>Game</LogoTitle>
            <GameCard>
                <Subtitle>ready to play</Subtitle>
                <Row>
                    <TetrisGrid rows={20} cols={10} cellSize={cellSize} showGrid={true} />
                    {/* Placeholder for next/score panel */}
                    <SidePanel>
                        <PanelTitle>Next</PanelTitle>
                        <NextBox />
                        <PanelTitle style={{ marginTop: '0.5rem' }}>Score</PanelTitle>
                        <ScoreBox>0</ScoreBox>
                    </SidePanel>
                </Row>
            </GameCard>
        </Wrapper>
    );
};

export default GamePage;
