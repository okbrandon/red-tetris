import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import TetrisGrid from './TetrisGrid';
import { useSelector } from 'react-redux';
import GameView from './GameView.jsx';
import useResponsiveValue from '../hooks/useResponsiveValue.js';
import { deriveBoardDimensions } from '../utils/tetris.js';
const ArenaContainer = styled.div`
    width: 80%;
    height: 100%;
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
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: clamp(12px, 2vw, 24px);
    padding: clamp(16px, 2vw, 24px);
    box-sizing: border-box;

    @media (min-width: 880px) {
        display: grid;
        grid-template-columns: clamp(280px, 34vw, 380px) minmax(0, 1fr);
        align-items: stretch;
    }
`;

const OpponentColumn = styled.section`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: clamp(0.8rem, 1.6vw, 1.2rem);
    min-height: 0;
    max-height: 100%;
    padding: clamp(1rem, 1.8vw, 1.6rem);
    border-radius: 18px;
    border: 1px solid rgba(142, 107, 225, 0.25);
    background: linear-gradient(160deg, rgba(24, 21, 39, 0.96), rgba(18, 15, 32, 0.9));
    box-shadow: 0 20px 34px rgba(8, 6, 18, 0.36);
`;

const SectionLabel = styled.h3`
    margin: 0;
    font-size: 0.76rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(215, 206, 246, 0.72);
    text-align: left;
`;

const OpponentList = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: clamp(0.75rem, 1.3vw, 1rem);
    flex: 1 1 auto;
    min-height: 0;
    align-content: start;
    justify-items: center;

    @media (max-width: 679px) {
        grid-template-columns: 1fr;
        justify-items: stretch;
    }
`;

const OpponentCard = styled.div`
    width: min(100%, 220px);
    min-width: 0;
    border-radius: 16px;
    border: 1px solid rgba(142, 107, 225, 0.18);
    background: linear-gradient(155deg, rgba(28, 24, 46, 0.92), rgba(16, 13, 28, 0.96));
    padding: 14px 18px 18px;
    display: grid;
    gap: 0.6rem;
    justify-items: center;
    position: relative;
    overflow: hidden;
    box-shadow: 0 18px 30px rgba(10, 7, 20, 0.32);
    box-sizing: border-box;
    flex: 0 0 auto;
`;

const OpponentBadge = styled.span`
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    border: 1px solid rgba(162, 130, 235, 0.32);
    background: rgba(28, 24, 46, 0.6);
    font-size: 0.65rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: rgba(190, 183, 232, 0.8);
`;

const OpponentName = styled.span`
    font-size: 0.8rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: rgba(229, 222, 255, 0.88);
`;

const OpponentHeader = styled.div`
    display: grid;
    gap: 0.4rem;
    justify-items: center;
    text-align: center;
`;

const MiniBoard = styled.div`
    display: flex;
    justify-content: center;
    border-radius: 12px;
    overflow: hidden;
    opacity: 0.95;
    pointer-events: none;
    width: 100%;
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
    text-align: center;
    width: 100%;
`;

const MainColumn = styled.section`
    display: flex;
    flex-direction: column;
    gap: clamp(0.6rem, 1.4vw, 1rem);
    min-height: 0;
    align-items: center;
    justify-content: center;
    max-height: 100%;
`;

const OpponentBoard = ({ opponent, index, cellSize }) => {
    const board = opponent?.specter ?? [];
    const { rows, cols } = deriveBoardDimensions(board);
    const name = opponent?.username ?? `Opponent ${index + 1}`;

    return (
        <OpponentCard>
            <OpponentHeader>
                <OpponentBadge>{`Player ${index + 1}`}</OpponentBadge>
                <OpponentName>{name}</OpponentName>
            </OpponentHeader>
            <MiniBoard>
                <TetrisGrid
                    rows={rows}
                    cols={cols}
                    cellSize={cellSize}
                    showGrid={false}
                    grid={board}
                />
            </MiniBoard>
        </OpponentCard>
    );
};

OpponentBoard.propTypes = {
    opponent: PropTypes.shape({
        id: PropTypes.string,
        username: PropTypes.string,
        name: PropTypes.string,
        specter: PropTypes.array,
        board: PropTypes.array,
        stats: PropTypes.object,
    }).isRequired,
    index: PropTypes.number.isRequired,
    cellSize: PropTypes.number.isRequired,
};

const computePrimaryCellSize = () => {
    if (typeof window === 'undefined') return 32;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const sidebarWidth = w >= 880 ? Math.min(Math.max(w * 0.34, 280), 400) : 0;
    const layoutPadding = w >= 880 ? 64 : 32;
    const availableWidth = w - sidebarWidth - layoutPadding;
    const widthBased = availableWidth / 10;
    const verticalPadding = Math.max(h * 0.3, 260);
    const availableHeight = Math.max(h - verticalPadding, 240);
    const heightBased = availableHeight / 20;
    const raw = Math.floor(Math.min(widthBased, heightBased));
    return Math.max(20, Math.min(raw, 42));
};

const estimateOpponentCellSize = (baseCellSize, opponentCount, tallestBoardRows = 20) => {
    const preferred = Math.max(10, Math.floor(baseCellSize * 0.45));
    const minimum = Math.max(4, Math.floor(baseCellSize * 0.18));
    const maximum = Math.max(preferred, Math.floor(baseCellSize * 0.55));

    if (!opponentCount) {
        return Math.max(minimum, Math.min(preferred, maximum));
    }

    if (typeof window === 'undefined') {
        return Math.max(minimum, Math.min(preferred, maximum));
    }

    const { innerHeight: height, innerWidth: width } = window;
    const arenaPadding = width >= 880 ? 80 : 48;
    const columnPadding = width >= 880 ? 56 : 40;
    const spacing = width >= 880 ? 18 : 14;
    const paddingAdjustedHeight = Math.max(height - arenaPadding, 320) - columnPadding;
    const availablePerCard = (paddingAdjustedHeight - spacing * Math.max(opponentCount - 1, 0)) / opponentCount;

    const chromeAllowance = 64;
    const heightRatio = (availablePerCard - chromeAllowance) / tallestBoardRows;
    const heightBound = Number.isFinite(heightRatio) ? Math.floor(heightRatio) : preferred;
    const safeCandidate = heightBound > 0 ? heightBound : minimum;

    const soloCap = Math.max(minimum, Math.floor(baseCellSize * 0.42));
    const duoCap = Math.max(minimum, Math.floor(baseCellSize * 0.36));
    const tierCap = opponentCount === 1
        ? Math.min(maximum, soloCap)
        : opponentCount === 2
            ? Math.min(maximum, duoCap)
            : maximum;

    return Math.max(minimum, Math.min(safeCandidate, tierCap));
};

const MultiplayerArena = ({ grid }) => {
    const cellSize = useResponsiveValue(useCallback(computePrimaryCellSize, []));

    const { you, multiplayer } = useSelector((state) => state.game);

    const player = you ?? null;

    const yourId = player?.id;
    const opponents = Array.isArray(multiplayer?.players)
        ? multiplayer.players.filter((opponent) => (yourId ? opponent?.id !== yourId : true))
        : [];

    const tallestOpponentRows = useMemo(() => {
        if (!opponents.length) return 20;
        return opponents.reduce((maxRows, opponent) => {
            const { rows } = deriveBoardDimensions(opponent?.specter ?? []);
            return rows > maxRows ? rows : maxRows;
        }, 0) || 20;
    }, [opponents]);

    const opponentCellSize = useMemo(
        () => estimateOpponentCellSize(cellSize, opponents.length, tallestOpponentRows),
        [cellSize, opponents.length, tallestOpponentRows]
    );

    return (
        <ArenaContainer>
            <ArenaLayout>
                <OpponentColumn>
                    <SectionLabel>{`Opponents${opponents.length ? ` (${opponents.length})` : ''}`}</SectionLabel>
                    {opponents.length ? (
                        <OpponentList aria-label='Opponent boards'>
                            {opponents.map((opponent, index) => (
                                <OpponentBoard
                                    key={opponent?.id || opponent?.username || opponent?.name || `opponent-${index}`}
                                    opponent={opponent}
                                    index={index}
                                    cellSize={opponentCellSize}
                                />
                            ))}
                        </OpponentList>
                    ) : (
                        <EmptyNotice>Waiting for challengers…</EmptyNotice>
                    )}
                </OpponentColumn>

                <MainColumn>
                    <GameView grid={grid} />
                </MainColumn>
            </ArenaLayout>
        </ArenaContainer>
    );
};

export default MultiplayerArena;
