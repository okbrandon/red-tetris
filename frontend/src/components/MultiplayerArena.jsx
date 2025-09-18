import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import TetrisGrid from './TetrisGrid';
import { Subtitle } from '../pages/HomePage.styled';

const ArenaContainer = styled.div`
    width: min(96vw, 1040px);
    height: min(84vh, 720px);
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    box-sizing: border-box;
`;

const ArenaLayout = styled.div`
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-areas:
        'main'
        'side';
    box-sizing: border-box;
    align-items: center;
    justify-items: center;
    overflow: hidden;

    @media (min-width: 880px) {
        grid-template-columns: clamp(220px, 24vw, 280px) minmax(0, 1fr);
        grid-template-areas: 'side main';
        align-items: stretch;
        justify-items: stretch;
    }
`;

const OpponentColumn = styled.section`
    grid-area: side;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    min-height: 0;
    max-height: 100%;
    padding: 20px 0;
`;

const SectionLabel = styled.h3`
    margin: 0;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(215, 206, 246, 0.7);
    text-align: center;
`;

const OpponentScroller = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.55rem;
    padding-right: 0.25rem;
    overflow-y: auto;
    height: 100%;
    width: 100%;
    box-sizing: border-box;
    flex: 1 1 auto;

    & > * {
        flex-shrink: 0;
        height: fit-content;
    }

    &::-webkit-scrollbar {
        width: 6px;
    }

    &::-webkit-scrollbar-thumb {
        background: rgba(162, 130, 235, 0.32);
        border-radius: 4px;
    }

    @media (max-width: 879px) {
        padding-right: 0;
    }
`;

const OpponentCard = styled.div`
    border-radius: 14px;
    height: fit-content;
    border: 1px solid rgba(142, 107, 225, 0.22);
    background: linear-gradient(155deg, rgba(26, 22, 45, 0.85), rgba(16, 13, 28, 0.92));
    padding: 10px 15px;
    display: grid;
    gap: 0.4rem;
    justify-items: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 16px 26px rgba(10, 7, 20, 0.34);
    width: 80%;
    box-sizing: border-box;
`;

const OpponentName = styled.span`
    font-size: 0.75rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(229, 222, 255, 0.88);
`;

const OpponentHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    text-align: center;
`;

const MiniBoard = styled.div`
    border-radius: 10px;
    overflow: hidden;
    opacity: 0.9;
    pointer-events: none;
`;

const EmptyNotice = styled.p`
    margin: 0;
    padding: clamp(0.6rem, 1.4vw, 0.85rem);
    border-radius: 12px;
    border: 1px solid rgba(142, 107, 225, 0.2);
    background: rgba(21, 19, 34, 0.54);
    font-size: 0.76rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: rgba(199, 191, 234, 0.68);
`;

const MainColumn = styled.section`
    grid-area: main;
    display: flex;
    flex-direction: column;
    gap: clamp(0.6rem, 1.4vw, 1rem);
    min-height: 0;
    align-items: center;
    justify-content: center;
    max-height: 100%;
`;

const PlayerPanel = styled.div`
    width: fit-content;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
`;

const PlayerBoardHolder = styled.div`
    width: fit-content;
    max-width: 100%;
    display: flex;
    justify-content: center;
`;

const PlayerBoardArea = styled.div`
    display: flex;
    gap: clamp(0.8rem, 2vw, 1.4rem);
    justify-content: center;
    align-items: stretch;
    flex-wrap: wrap;
    width: 100%;
    max-width: clamp(320px, 90vw, 640px);
`;

const PlayerName = styled.h2`
    margin: 0;
    font-size: clamp(1.15rem, 2vw, 1.6rem);
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: ${({ $highlight }) => ($highlight ? '#f9f1ff' : 'rgba(234, 226, 255, 0.9)')};
`;

const EmptyPanel = styled.div`
    width: fit-content;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    align-items: center;
    padding: clamp(0.9rem, 2vw, 1.2rem);
    border-radius: 12px;
    border: 1px dashed rgba(142, 107, 225, 0.32);
    background: rgba(23, 21, 36, 0.42);
    text-align: center;
`;

const StatsTray = styled.div`
    display: grid;
    gap: 0.55rem;
    align-content: center;
    justify-items: stretch;
    min-width: clamp(150px, 28vw, 200px);
    flex: 0 0 auto;

    @media (max-width: 620px) {
        flex: 1 1 100%;
        width: clamp(220px, 84vw, 420px);
        grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    }
`;

const StatPill = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
    padding: 0.5rem 0.85rem;
    border-radius: 18px;
    border: 1px solid rgba(162, 130, 235, 0.32);
    background: rgba(42, 36, 66, 0.76);
    box-shadow: inset 0 1px 0 rgba(217, 206, 255, 0.18);
`;

const StatValue = styled.span`
    font-size: 0.94rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #f6f1ff;
`;

const StatLabel = styled.span`
    font-size: 0.56rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: rgba(207, 198, 236, 0.68);
`;

const MULTIPLAYER_COLORS = {
    1: 'rgba(0,229,255,1)',
    2: 'rgba(255,149,0,1)',
    3: 'rgba(0,122,255,1)',
    4: 'rgba(255,59,48,1)',
    5: 'rgba(255,214,10,1)',
    6: 'rgba(191,90,242,1)',
    7: 'rgba(52,199,89,1)',
    8: 'rgba(120,120,150,1)',
};

const playerShape = PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    isSelf: PropTypes.bool,
    status: PropTypes.string,
    board: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
    activePiece: PropTypes.object,
    activePos: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
    animateMs: PropTypes.number,
    clearingRows: PropTypes.arrayOf(PropTypes.number),
    clearAnimMs: PropTypes.number,
    stats: PropTypes.shape({
        linesCleared: PropTypes.number,
        penaltiesSent: PropTypes.number,
        penaltiesReceived: PropTypes.number,
    }),
});

const OpponentBoard = ({ opponent, cellSize }) => (
    <OpponentCard>
        <OpponentHeader>
            <OpponentName>{opponent.name}</OpponentName>
        </OpponentHeader>
        <MiniBoard>
            <TetrisGrid
                rows={20}
                cols={10}
                cellSize={cellSize}
                showGrid={false}
                matrix={opponent.board}
                activePiece={opponent.activePiece}
                activePos={opponent.activePos}
                animateMs={opponent.animateMs ?? 140}
                clearingRows={opponent.clearingRows}
                clearAnimMs={opponent.clearAnimMs ?? 220}
                colors={MULTIPLAYER_COLORS}
            />
        </MiniBoard>
    </OpponentCard>
);

OpponentBoard.propTypes = {
    opponent: playerShape.isRequired,
    cellSize: PropTypes.number.isRequired,
};

const PlayerField = ({ player, cellSize }) => (
    <PlayerPanel>
        <PlayerBoardArea>
            <PlayerBoardHolder>
                <TetrisGrid
                    rows={20}
                    cols={10}
                    cellSize={cellSize}
                    showGrid
                    matrix={player.board}
                    activePiece={player.activePiece}
                    activePos={player.activePos}
                    animateMs={player.animateMs ?? 140}
                    clearingRows={player.clearingRows}
                    clearAnimMs={player.clearAnimMs ?? 220}
                    colors={MULTIPLAYER_COLORS}
                />
            </PlayerBoardHolder>
            <StatsTray>
                <StatPill>
                    <StatValue>{player.stats?.linesCleared ?? 0}</StatValue>
                    <StatLabel>Lines Cleared</StatLabel>
                </StatPill>
                <StatPill>
                    <StatValue>{player.stats?.penaltiesSent ?? 0}</StatValue>
                    <StatLabel>Penalties Sent</StatLabel>
                </StatPill>
                <StatPill>
                    <StatValue>{player.stats?.penaltiesReceived ?? 0}</StatValue>
                    <StatLabel>Penalties Received</StatLabel>
                </StatPill>
            </StatsTray>
        </PlayerBoardArea>
    </PlayerPanel>
);

PlayerField.propTypes = {
    player: playerShape.isRequired,
    cellSize: PropTypes.number.isRequired,
};

const computePrimaryCellSize = () => {
    if (typeof window === 'undefined') return 32;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const sidebarWidth = w >= 880 ? Math.min(Math.max(w * 0.24, 220), 320) : 0;
    const layoutPadding = w >= 880 ? 56 : 32;
    const availableWidth = w - sidebarWidth - layoutPadding;
    const widthBased = availableWidth / 10;
    const verticalPadding = Math.max(h * 0.3, 260);
    const availableHeight = Math.max(h - verticalPadding, 240);
    const heightBased = availableHeight / 20;
    const raw = Math.floor(Math.min(widthBased, heightBased));
    return Math.max(20, Math.min(raw, 42));
};

const MultiplayerArena = ({ players }) => {
    const [cellSize, setCellSize] = useState(computePrimaryCellSize);

    useEffect(() => {
        const onResize = () => setCellSize(computePrimaryCellSize());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const playerList = Array.isArray(players) && players.length ? players : [];
    const you = playerList.find((p) => p.isSelf) || playerList[0];
    const opponents = playerList.filter((p) => p !== you);
    const opponentCellSize = useMemo(() => Math.max(10, Math.floor(cellSize * 0.4)), [cellSize]);

    return (
        <ArenaContainer>
            <ArenaLayout>
                <OpponentColumn>
                    <SectionLabel>{`Opponents${opponents.length ? ` (${opponents.length})` : ''}`}</SectionLabel>
                    {opponents.length ? (
                        <OpponentScroller aria-label='Opponent boards'>
                            {opponents.map((opponent) => (
                                <OpponentBoard key={opponent.id || opponent.name} opponent={opponent} cellSize={opponentCellSize} />
                            ))}
                        </OpponentScroller>
                    ) : (
                        <EmptyNotice>Waiting for challengers…</EmptyNotice>
                    )}
                </OpponentColumn>

                <MainColumn>
                    {you ? (
                        <PlayerField player={you} cellSize={cellSize} />
                    ) : (
                        <EmptyPanel>
                            <PlayerName>No Active Board</PlayerName>
                            <Subtitle>Join a match to start stacking.</Subtitle>
                        </EmptyPanel>
                    )}
                </MainColumn>
            </ArenaLayout>
        </ArenaContainer>
    );
};

MultiplayerArena.propTypes = {
    players: PropTypes.arrayOf(playerShape),
};

export default MultiplayerArena;
