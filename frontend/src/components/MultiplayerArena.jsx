import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import TetrisGrid from './TetrisGrid';
import { useSelector } from 'react-redux';
import GameView from './GameView.jsx';
import useResponsiveValue from '../hooks/useResponsiveValue.js';
import { deriveBoardDimensions } from '../utils/tetris.js';
import {
    ArenaContainer,
    ArenaLayout,
    OpponentColumn,
    SectionLabel,
    OpponentList,
    OpponentCard,
    OpponentBadge,
    OpponentName,
    OpponentHeader,
    MiniBoard,
    EmptyNotice,
    MainColumn,
} from './MultiplayerArena.styled.js';

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

const MultiplayerArena = ({ grid, resultModal }) => {
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
                    <GameView grid={grid} resultModal={resultModal} />
                </MainColumn>
            </ArenaLayout>
        </ArenaContainer>
    );
};

MultiplayerArena.propTypes = {
    grid: PropTypes.arrayOf(PropTypes.array).isRequired,
    resultModal: PropTypes.shape({
        isOpen: PropTypes.bool,
        outcome: PropTypes.shape({
            outcome: PropTypes.string,
            message: PropTypes.string,
        }),
        onConfirm: PropTypes.func,
        isOwner: PropTypes.bool,
    }),
};

export default MultiplayerArena;
