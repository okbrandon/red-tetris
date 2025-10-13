import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import TetrisGrid from './TetrisGrid.jsx';
import useResponsiveValue from '../hooks/useResponsiveValue.js';
import { deriveBoardDimensions } from '../utils/tetris.js';
import {
    SpectatorContainer,
    SpectatorLayout,
    SpectatorActions,
    ExitButton,
    FocusedPanel,
    FocusedHeader,
    FocusedBadge,
    FocusedName,
    FocusedContent,
    SpectatorBoard,
    FocusedStats,
    StatRow,
    StatLabel,
    StatValue,
    SpectatorList,
    SpectatorCard,
    SpectatorLabel,
    SpectatorName,
    SpectatorMiniBoard,
    EmptyState,
} from './SpectatorArena.styled.js';

const deriveSpectatorScale = (count) => {
    if (count <= 1) return 1;
    if (count === 2) return 0.95;
    if (count === 3) return 0.9;
    const scaled = 0.9 - (count - 3) * 0.045;
    return Math.max(scaled, 0.6);
};

const computeFocusedCellSize = (rows = 20, cols = 10) => {
    if (typeof window === 'undefined') return 30;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const sidebarWidth = w >= 960 ? Math.min(Math.max(w * 0.36, 320), 420) : 0;
    const padding = w >= 960 ? 176 : 92;
    const availableWidth = Math.max(w - sidebarWidth - padding, 300);
    const maxByWidth = availableWidth / cols;
    const availableHeight = Math.max(h - 320, 320);
    const maxByHeight = availableHeight / rows;
    const raw = Math.floor(Math.min(maxByWidth, maxByHeight));
    return Math.max(18, Math.min(raw, 42));
};

const computeStats = (player) => {
    if (!player || typeof player !== 'object') return [];
    const stats = player.stats || {};

    const entries = [];
    const score = stats.score ?? player.score;
    if (typeof score === 'number') {
        entries.push({ label: 'Score', value: score });
    }
    const lines = stats.linesCleared ?? stats.lines ?? player.linesCleared;
    if (typeof lines === 'number') {
        entries.push({ label: 'Lines', value: lines });
    }
    const level = stats.level ?? player.level;
    if (typeof level === 'number') {
        entries.push({ label: 'Level', value: level });
    }

    return entries;
};

const SpectatorArena = ({ onExit }) => {
    const { you, players: gamePlayers } = useSelector((state) => state.game);

    const players = Array.isArray(gamePlayers) ? gamePlayers : [];
    const opponents = useMemo(
        () => players.filter((player) => (you?.id ? player?.id !== you.id : true)),
        [players, you?.id]
    );

    const [selectedId, setSelectedId] = useState(() => opponents[0]?.id ?? null);

    useEffect(() => {
        if (!opponents.length) {
            setSelectedId(null);
            return;
        }
        const firstId = opponents[0]?.id ?? null;
        const hasSelected = selectedId && opponents.some((player) => player?.id === selectedId);
        if (!hasSelected && selectedId !== firstId) {
            setSelectedId(firstId);
        }
    }, [opponents, selectedId]);

    const focusedPlayer = useMemo(
        () => opponents.find((player) => player?.id === selectedId) ?? opponents[0] ?? null,
        [opponents, selectedId]
    );

    const focusedBoard = Array.isArray(focusedPlayer?.specter) ? focusedPlayer.specter : [];
    const { rows, cols } = useMemo(
        () => deriveBoardDimensions(focusedBoard),
        [focusedBoard]
    );
    const safeRows = rows || 20;
    const safeCols = cols || 10;
    const focusedCellSize = useResponsiveValue(
        useCallback(() => computeFocusedCellSize(safeRows, safeCols), [safeRows, safeCols])
    );
    const spectatorScale = useMemo(
        () => deriveSpectatorScale(opponents.length),
        [opponents.length]
    );
    const previewCellSize = useMemo(() => {
        const base = Math.max(7, Math.floor((focusedCellSize || 20) * 0.4));
        const widthAllowance = Math.floor(Math.max(6, ((170 - 32) * spectatorScale) / 10));
        return Math.max(6, Math.min(base, widthAllowance));
    }, [focusedCellSize, spectatorScale]);
    const focusedStats = useMemo(() => computeStats(focusedPlayer), [focusedPlayer]);

    return (
        <SpectatorContainer>
            <SpectatorLayout>
                {typeof onExit === 'function' && (
                    <SpectatorActions>
                        <ExitButton type='button' onClick={onExit}>
                            Return to Arena View
                        </ExitButton>
                    </SpectatorActions>
                )}
                {!opponents.length ? (
                    <EmptyState>No active players to spectate right now.</EmptyState>
                ) : null}
                {opponents.length > 0 && (
                    <>
                        <FocusedPanel>
                            <FocusedHeader>
                                <FocusedBadge>Watching</FocusedBadge>
                                <FocusedName>
                                    {focusedPlayer?.username || focusedPlayer?.name || 'Opponent'}
                                </FocusedName>
                            </FocusedHeader>
                            <FocusedContent>
                                <SpectatorBoard>
                                    <TetrisGrid
                                        rows={rows}
                                        cols={cols}
                                        cellSize={focusedCellSize}
                                        showGrid
                                        grid={focusedBoard}
                                    />
                                </SpectatorBoard>
                                {focusedStats.length > 0 && (
                                    <FocusedStats>
                                        {focusedStats.map(({ label, value }) => (
                                            <StatRow key={label}>
                                                <StatLabel>{label}</StatLabel>
                                                <StatValue>{value}</StatValue>
                                            </StatRow>
                                        ))}
                                    </FocusedStats>
                                )}
                            </FocusedContent>
                        </FocusedPanel>
                        <SpectatorList
                            aria-label='Players to spectate'
                            style={{ '--card-scale': spectatorScale }}
                        >
                            {opponents.map((opponent, index) => {
                                const miniBoard = Array.isArray(opponent?.specter) ? opponent.specter : [];
                                const { rows: miniRows, cols: miniCols } = deriveBoardDimensions(miniBoard);
                                const ordinal = index + 1;
                                return (
                                    <SpectatorCard
                                        key={opponent?.id || opponent?.username || `spectator-${index}`}
                                        $active={opponent?.id === focusedPlayer?.id}
                                        role='button'
                                        tabIndex={0}
                                        aria-pressed={opponent?.id === focusedPlayer?.id}
                                        onClick={() => setSelectedId(opponent?.id || null)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' || event.key === ' ') {
                                                event.preventDefault();
                                                setSelectedId(opponent?.id || null);
                                            }
                                        }}
                                    >
                                        <SpectatorLabel>{`Player ${ordinal}`}</SpectatorLabel>
                                        <SpectatorName>
                                            {opponent?.username || opponent?.name || `Opponent ${ordinal}`}
                                        </SpectatorName>
                                        <SpectatorMiniBoard>
                                            <TetrisGrid
                                                rows={miniRows}
                                                cols={miniCols}
                                                cellSize={previewCellSize}
                                                showGrid={false}
                                                grid={miniBoard}
                                            />
                                        </SpectatorMiniBoard>
                                    </SpectatorCard>
                                );
                            })}
                        </SpectatorList>
                    </>
                )}
            </SpectatorLayout>
        </SpectatorContainer>
    );
};

SpectatorArena.propTypes = {
    onExit: PropTypes.func,
};

export default SpectatorArena;
